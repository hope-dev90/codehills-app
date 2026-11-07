import type { ChangeEvent } from 'react';

interface FieldShellProps {
  label?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function FieldShell({ label, hint, htmlFor, children }: FieldShellProps) {
  return (
    <div className="field">
      {label ? <label htmlFor={htmlFor}>{label}</label> : null}
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

export interface TextFieldProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  id?: string;
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  type = 'text',
  placeholder,
  multiline = false,
  rows = 4,
  disabled = false,
  id,
}: TextFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      {multiline ? (
        <textarea
          id={id}
          className="textarea"
          rows={rows}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
        />
      ) : (
        <input
          id={id}
          className="input"
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
        />
      )}
    </FieldShell>
  );
}

export interface SelectFieldProps {
  label?: string;
  hint?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export function SelectField({
  label,
  hint,
  value,
  options,
  onChange,
  disabled = false,
  id,
}: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <select
        id={id}
        className="select"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <label className="checkbox-field">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
