import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedPlan } from './saved-plan.entity';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PlanTripDto {
  @IsNumber()
  budget: number;

  @IsNumber()
  duration: number;

  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  destination?: string;
}

export class CreateSavedPlanDto {
  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsNumber()
  durationDays: number;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  travelers?: string;

  @IsNotEmpty()
  itinerary: any;
}

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(SavedPlan)
    private savedPlansRepository: Repository<SavedPlan>,
  ) {}

  async planTrip(planTripDto: PlanTripDto) {
    const { budget, duration, interests, startDate, destination } = planTripDto;

    const prompt = `
Create a detailed ${duration}-day travel itinerary.
Budget: ${budget} INR
Destination: ${destination || 'Suggest a suitable destination in India'}
Interests: ${interests.join(', ')}
Start Date: ${startDate}

Return:
1. Trip summary
2. Recommended destination
3. Daily plan (Day 1 to Day ${duration})
4. Budget breakdown
5. Packing list
6. Travel tips

Keep it realistic for an Indian traveler.
`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      const data = await response.json();

      return {
        message: 'AI trip plan generated successfully',
        result: data?.choices?.[0]?.message?.content || 'No response',
      };
    } catch (error) {
      console.error('GROQ ERROR:', error);
      throw new InternalServerErrorException(
        error.message || 'Failed to generate AI trip plan',
      );
    }
  }

  async savePlan(userId: string, dto: CreateSavedPlanDto) {
    const plan = this.savedPlansRepository.create({
      ...dto,
      userId,
    });
    const saved = await this.savedPlansRepository.save(plan);
    return { ...saved, _id: saved.id };
  }

  async findUserPlans(userId: string) {
    const plans = await this.savedPlansRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return plans.map(p => ({ ...p, _id: p.id }));
  }

  async removePlan(userId: string, id: string) {
    const plan = await this.savedPlansRepository.findOne({ where: { id, userId } });
    if (!plan) throw new NotFoundException('Saved plan not found');
    await this.savedPlansRepository.remove(plan);
    return { message: 'Plan removed successfully' };
  }
}