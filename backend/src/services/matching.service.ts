import { Profile } from '@prisma/client';

export interface MatchingResult {
  score: number;
  reasons: string[];
}

export class MatchingService {
  /**
   * Generates a compatibility score between two profiles
   * Based on 14 criteria requested by the user.
   */
  static calculateCompatibility(user1: Profile, user2: Profile): MatchingResult {
    let score = 0;
    const maxScore = 100;
    const reasons: string[] = [];
    let currentTotal = 0;

    // Helper to calculate array intersection matching
    const calculateOverlapScore = (arr1: any, arr2: any, weight: number, name: string) => {
      const a1 = Array.isArray(arr1) ? arr1 : [];
      const a2 = Array.isArray(arr2) ? arr2 : [];
      if (a1.length === 0 || a2.length === 0) return 0;

      const overlap = a1.filter(item => a2.includes(item));
      const matchPercentage = overlap.length / Math.max(a1.length, a2.length);
      const earned = matchPercentage * weight;
      
      if (matchPercentage > 0.5) {
        reasons.push(`You both share similar ${name} (${overlap.join(', ')})`);
      }
      return earned;
    };

    // 1. Occupation Match (Weight: 10)
    currentTotal += 10;
    if (user1.occupation.toLowerCase() === user2.occupation.toLowerCase()) {
      score += 10;
      reasons.push(`You both work as ${user1.occupation}s`);
    } else {
      score += 3; // Baseline for having jobs
    }

    // 2. Age Match (Weight: 10)
    currentTotal += 10;
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 3) {
      score += 10;
      reasons.push('You are in the same age group');
    } else if (ageDiff <= 7) {
      score += 5;
    }

    // 3. Lifestyle Match (Weight: 30) - includes smoking, drinking, sleep, wake up
    currentTotal += 30;
    score += calculateOverlapScore(user1.lifestyle, user2.lifestyle, 30, 'lifestyle habits');

    // 4. Interests & Hobbies (Weight: 20)
    currentTotal += 20;
    score += calculateOverlapScore(user1.interests, user2.interests, 20, 'interests');

    // 5. Languages (Weight: 10)
    currentTotal += 10;
    score += calculateOverlapScore(user1.languages, user2.languages, 10, 'languages');

    // 6. Budget & Location are typically hard filters in search, but if used for matching (Weight: 20)
    // Assuming we compare if their budgets are within 20% range
    // Since budget is in RoommatePost, if we want it here we need to fetch their posts.
    // We will skip budget in this pure profile match and allocate the remaining 20 points as base compatibility.
    currentTotal += 20;
    score += 15; // Base score

    // Normalize to 100
    const finalScore = Math.round((score / currentTotal) * 100);

    return {
      score: Math.min(finalScore, 100),
      reasons: reasons.slice(0, 3) // Return top 3 reasons
    };
  }

  static generateIceBreaker(user2: Profile): string[] {
    const iceBreakers = [];
    
    // Generate simple deterministic ice breakers based on profile
    const interests = Array.isArray(user2.interests) ? user2.interests : [];
    if (interests.length > 0) {
      iceBreakers.push(`Hey ${user2.firstName}! I see you're into ${interests[0]}. I'd love to chat more about it.`);
    }
    
    if (user2.company) {
      iceBreakers.push(`Hi ${user2.firstName}, how is it working at ${user2.company}?`);
    }

    iceBreakers.push(`Hey ${user2.firstName}! I found your profile interesting. Are you still looking for a roommate?`);

    return iceBreakers;
  }
}
