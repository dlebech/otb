declare module 'bayes' {
  interface BayesOptions {
    tokenizer?: (text: string) => string[];
  }
  
  interface ClassifierInstance {
    learn(text: string, category: string): Promise<void>;
    categorize(text: string): Promise<string>;
    toJson(): string;
  }
  
  interface BayesStatic {
    (options?: BayesOptions): ClassifierInstance;
    fromJson(json: string): ClassifierInstance;
  }
  
  const bayes: BayesStatic;
  export = bayes;
}