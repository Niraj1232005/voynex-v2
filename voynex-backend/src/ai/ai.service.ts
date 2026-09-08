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
Create a detailed ${duration}-day travel itinerary for a traveler.
Budget: ${budget} INR
Destination: ${destination || 'Suggest a suitable destination in India'}
Interests: ${interests && interests.length ? interests.join(', ') : 'Sightseeing, adventure'}
Start Date: ${startDate}

Please format the response nicely in Markdown with clear headings:
# ${destination ? destination.toUpperCase() : 'AMAZING TRAVEL'} - ${duration} DAY ITINERARY

## 🌟 Trip Overview & Highlights
(Brief summary of what to expect and best spots)

## 📅 Day-by-Day Plan
(Provide detailed morning, afternoon, and evening activities for Day 1 through Day ${duration})

## 💰 Realistic Budget Breakdown
- Accommodation: ...
- Food & Dining: ...
- Transport & Sightseeing: ...
- Buffer/Emergency: ...
- Total: Approx ${budget} INR

## 🎒 Essential Packing Checklist
- Specific essentials for this destination and season

## 💡 Pro Travel Tips & Local Etiquette
- Practical tips for getting around, local cuisine to try, and safety
`;

    // 1. Try Groq with qwen/qwen3.8-27b (ultra-fast)
    if (process.env.GROQ_API_KEY) {
      const groqModels = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
      for (const model of groqModels) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text && text.trim().length > 0) {
              return {
                message: 'AI trip plan generated successfully',
                result: text,
              };
            }
          }
        } catch (groqErr) {
          console.warn(`Groq model ${model} attempt failed:`, groqErr?.message || groqErr);
        }
      }
    }

    // 2. Try OpenRouter if available
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text && text.trim().length > 0) {
            return {
              message: 'AI trip plan generated successfully',
              result: text,
            };
          }
        }
      } catch (orErr) {
        console.warn('OpenRouter attempt failed:', orErr?.message || orErr);
      }
    }

    // 3. Resilient Fallback Template (guarantees the user always gets a rich, structured plan)
    const destName = destination || 'Goa & Western Ghats';
    const fallbackItinerary = `
# ${destName.toUpperCase()} - ${duration}-DAY CURATED ITINERARY

## 🌟 Trip Overview & Highlights
Get ready for an unforgettable journey to **${destName}**! This curated ${duration}-day plan is tailored for a budget of **₹${budget.toLocaleString('en-IN')}** focusing on **${interests && interests.length ? interests.join(', ') : 'Adventure & Relaxation'}**.

---

## 📅 Day-by-Day Plan
${Array.from({ length: duration }, (_, i) => `
### Day ${i + 1}: ${i === 0 ? 'Arrival & First Impressions' : i === duration - 1 ? 'Souvenir Hunting & Departure' : `Exploring the Best of ${destName}`}
- **Morning**: Traditional local breakfast, settle in, visit the premier landmark or scenic viewpoint.
- **Afternoon**: Enjoy authentic local dining followed by guided exploration or outdoor activities (${interests?.[0] || 'sightseeing'}).
- **Evening**: Catch the sunset at a scenic vantage point, stroll through local markets, and enjoy dinner at a renowned local spot.
`).join('\n')}

---

## 💰 Estimated Budget Breakdown (₹${budget.toLocaleString('en-IN')} Total)
- **Accommodation (${duration} Nights)**: ₹${Math.round(budget * 0.4).toLocaleString('en-IN')}
- **Food & Dining**: ₹${Math.round(budget * 0.25).toLocaleString('en-IN')}
- **Activities & Entry Tickets**: ₹${Math.round(budget * 0.2).toLocaleString('en-IN')}
- **Local Transport & Buffer**: ₹${Math.round(budget * 0.15).toLocaleString('en-IN')}

---

## 🎒 Essential Packing Checklist
- Comfortable lightweight walking shoes & sandals
- Breathable cotton clothes & light jacket/layer
- Power bank, universal adapter, and offline map downloads
- First-aid essentials, sunscreen SPF 50+, insect repellent

## 💡 Local Travel Tips
1. Book inter-city transport and major entry permits at least 2 weeks in advance.
2. Carry sufficient cash as small vendors and rural spots often prefer UPI or cash.
3. Try local street delicacies from verified, bustling eateries.
`;

    return {
      message: 'Trip plan generated successfully',
      result: fallbackItinerary.trim(),
    };
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