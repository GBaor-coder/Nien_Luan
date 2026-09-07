interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
      errors?: string[];
    };
  };
  message?: string;
}

export const getErrorMessage = (err: unknown, fallback: string): string => {
  const apiErr = err as ApiErrorShape;
  return apiErr?.response?.data?.errors?.[0] || apiErr?.response?.data?.message || apiErr?.message || fallback;
};
