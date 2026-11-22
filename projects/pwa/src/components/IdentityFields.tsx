import React, { useState } from 'react';
import { normalizeIdentifier } from '@open-mountain/domain';
export function IdentifierInput({
  onChange,
  defaultValue,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="text"
      defaultValue={
        typeof defaultValue === 'string' ? normalizeIdentifier(defaultValue) : defaultValue
      }
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      pattern="[a-z0-9-]+"
      onChange={(event) => {
        const input = event.currentTarget;
        const cursor = normalizeIdentifier(
          input.value.slice(0, input.selectionStart ?? input.value.length),
        ).length;
        input.value = normalizeIdentifier(input.value);
        input.setSelectionRange(cursor, cursor);
        onChange?.(event);
      }}
    />
  );
}
export function CommunityFields({
  nameLabel = 'Community name',
  defaultName = '',
}: {
  nameLabel?: string;
  defaultName?: string;
}) {
  const [name, setName] = useState(defaultName),
    [id, setId] = useState(normalizeIdentifier(defaultName)),
    [custom, setCustom] = useState(false);
  return (
    <>
      <label>
        {nameLabel}
        <input
          aria-label={nameLabel}
          name="community"
          required
          maxLength={100}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!custom) setId(normalizeIdentifier(e.target.value));
          }}
        />
      </label>
      <label>
        Community ID
        <IdentifierInput
          aria-label="Community ID"
          name="communityId"
          required
          maxLength={100}
          value={id}
          onChange={(e) => {
            setCustom(true);
            setId(e.target.value);
          }}
        />
      </label>
      <p className="hint">
        The name is separate from the ID. IDs use lowercase letters, numbers and hyphens; spaces
        become hyphens. Choose a unique ID when creating a community.
      </p>
    </>
  );
}
