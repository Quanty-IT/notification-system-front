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
  isDisabled?: boolean;
  width?: string;
};
