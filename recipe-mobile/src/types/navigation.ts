// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  RecipeDetail: { recipeId: string };
  Login: undefined;
  Signup: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Search: undefined;
  Saved: undefined;
  Recommendations: undefined;
  Profile: undefined;
};
