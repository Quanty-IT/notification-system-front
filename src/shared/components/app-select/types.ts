export type AppSelectOption = {
  label: string;
  value: string;
};

export type AppSelectProps = {
  value?: string;
  placeholder?: string;
  options: {
    label: string;
    value: string;
  }[];
  onChange: (value: string) => void;
  hasError?: boolean;
  isDisabled?: boolean;
  width?: string;
};
