import Select from 'react-select';
import { AppSelectOption, AppSelectProps } from './types';

export const AppSelect = ({ value, options, placeholder, isDisabled, onChange, width = '100%' }: AppSelectProps) => {
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
          borderColor: state.isFocused ? 'var(--chakra-colors-primary)' : 'var(--chakra-colors-inputBorder)',
          boxShadow: state.isFocused
            ? '0 0 0 1px var(--chakra-colors-primary)'
            : '0 6px 18px rgba(15, 23, 42, 0.06)',
          backgroundColor: 'var(--chakra-colors-inputBg)',
          padding: '0 6px',
          cursor: 'pointer',
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
          backgroundColor: 'var(--chakra-colors-surface)',
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? 'var(--chakra-colors-secondary)'
            : state.isFocused
              ? 'var(--chakra-colors-surfaceMuted)'
              : 'var(--chakra-colors-surface)',
          color: state.isSelected ? '#fff' : 'var(--chakra-colors-text)',
          fontWeight: state.isSelected ? 700 : 500,
          cursor: 'pointer',
        }),
        singleValue: (base) => ({
          ...base,
          color: 'var(--chakra-colors-text)',
          fontWeight: 600,
        }),
        placeholder: (base) => ({
          ...base,
          color: 'var(--chakra-colors-placeholder)',
          fontWeight: 500,
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
      }}
    />
  );
};
