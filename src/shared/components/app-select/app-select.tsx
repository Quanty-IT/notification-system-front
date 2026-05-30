import Select from 'react-select';
import { AppSelectOption, AppSelectProps } from './types';

const cssVars = {
  border: 'var(--chakra-colors-inputBorder, var(--chakra-colors-input-border, #C7D1C2))',
  error: 'var(--chakra-colors-error, #E63946)',
  inputBg: 'var(--chakra-colors-inputBg, var(--chakra-colors-input-bg, #FFFFFF))',
  placeholder: 'var(--chakra-colors-placeholder, #7A8578)',
  primary: 'var(--chakra-colors-primary, #367C2B)',
  secondary: 'var(--chakra-colors-secondary, #2C5E1A)',
  surface: 'var(--chakra-colors-surface, #FFFFFF)',
  surfaceMuted: 'var(--chakra-colors-surfaceMuted, var(--chakra-colors-surface-muted, #F7FAF4))',
  text: 'var(--chakra-colors-text, #1F2A1F)',
};

export const AppSelect = ({
  value,
  options,
  placeholder,
  hasError,
  isDisabled,
  onChange,
  width = '100%',
}: AppSelectProps) => {
  const selectedOption = options.find((option) => option.value === value) ?? null;

  return (
    <Select<AppSelectOption>
      value={selectedOption}
      options={options}
      placeholder={placeholder}
      isDisabled={isDisabled}
      onChange={(option) => onChange(option?.value ?? '')}
      styles={{
        container: (base) => ({
          ...base,
          width,
        }),
        control: (base, state) => ({
          ...base,
          width: '100%',
          minHeight: '52px',
          borderRadius: '12px',
          borderColor: hasError ? cssVars.error : state.isFocused ? cssVars.primary : cssVars.border,
          borderWidth: '1px',
          boxShadow: hasError
            ? `0 0 0 1px ${cssVars.error}`
            : state.isFocused
              ? `0 0 0 1px ${cssVars.primary}`
              : '0 6px 18px rgba(15, 23, 42, 0.06)',
          backgroundColor: cssVars.inputBg,
          padding: '0 6px',
          cursor: 'pointer',
          '&:hover': {
            borderColor: hasError ? cssVars.error : cssVars.primary,
          },
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0 10px',
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
          zIndex: 30,
          backgroundColor: cssVars.surface,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? cssVars.secondary
            : state.isFocused
              ? cssVars.surfaceMuted
              : cssVars.surface,
          color: state.isSelected ? '#fff' : cssVars.text,
          fontWeight: state.isSelected ? 700 : 500,
          cursor: 'pointer',
        }),
        singleValue: (base) => ({
          ...base,
          color: cssVars.text,
          fontWeight: 600,
        }),
        placeholder: (base) => ({
          ...base,
          color: cssVars.placeholder,
          fontWeight: 500,
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
      }}
    />
  );
};
