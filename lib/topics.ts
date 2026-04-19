export const TOPICS = [
  "number_sense",
  "operations",
  "fractions_decimals",
  "ratio_percent",
  "geometry_measurement",
  "word_problems_data",
] as const;

export type Topic = (typeof TOPICS)[number];

export const TOPIC_LABELS: Record<Topic, string> = {
  number_sense: "Number Sense & Place Value",
  operations: "Operations & Arithmetic",
  fractions_decimals: "Fractions & Decimals",
  ratio_percent: "Ratio, Proportion & Percentages",
  geometry_measurement: "Geometry & Measurement",
  word_problems_data: "Word Problems & Data Interpretation",
};

// Target question count per topic, per PRD §5.1.
export const TOPIC_TARGET_COUNT: Record<Topic, number> = {
  number_sense: 5,
  operations: 5,
  fractions_decimals: 6,
  ratio_percent: 4,
  geometry_measurement: 5,
  word_problems_data: 5,
};
