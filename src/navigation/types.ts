export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Onboarding: undefined;
  Login: undefined;
  LocationSelect: undefined;
  ForgotPassword: undefined;
  OTP: {phone: string};
  SignUp: undefined;
  MainTabs: undefined;
  Wishlist: undefined;
  Cart: undefined;
  OrderSuccess: undefined;
  Search: {query?: string} | undefined;
  ProductDetail: {
    id?: string;
    name?: string;
    price?: string;
    originalPrice?: string;
    discount?: string;
    image?: string;
    description?: string;
  };
};

export type BottomTabParamList = {
  Home: undefined;
  SearchTab: undefined;
  Orders: undefined;
  Favorites: undefined;
  Account: undefined;
};
