// The three showcase questions (plus the alerts card) used across the home screen
// and the mock router. Each one exercises a full pass through the pipeline.

export const SHOWCASE_PROMPTS = {
  tourism:
    "Is the weather good for a 3-day trip to Da Nang and Hoi An starting tomorrow? Plan each day around the weather and include local specialties I should try.",
  construction:
    "We plan to pour the deck slab at Hoa Lien Overpass on Friday morning and run the tower crane all day. Is Friday safe? If not, when is the best pour window this week, and when must the crane stop?",
  agriculture:
    "Our Hoa Vang rice cooperative (145 ha) is at tillering. Do we need to irrigate this week, and when should we top-dress urea and spray for rice blast so rain doesn't wash it off?",
  severe_weather:
    "Are there any severe weather alerts or typhoons near Da Nang this week, and what should I change?",
} as const;

export type ShowcaseKey = keyof typeof SHOWCASE_PROMPTS;
