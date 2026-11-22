import React, { useState } from 'react';
import { normalizeIdentifier } from '@open-mountain/domain';
import { Field, Note } from './Controls';
export function IdentifierField({
  value,
  onChangeText,
  ...props
}: React.ComponentProps<typeof Field>) {
  return (
    <Field
      {...props}
      value={value}
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={(text) => onChangeText?.(normalizeIdentifier(text))}
    />
  );
}
export function CommunityFields({
  name,
  id,
  onChange,
  nameLabel = 'Community name',
}: {
  name: string;
  id: string;
  onChange: (name: string, id: string) => void;
  nameLabel?: string;
}) {
  const [custom, setCustom] = useState(false);
  return (
    <>
      <Field
        label={nameLabel}
        value={name}
        maxLength={100}
        onChangeText={(text) => onChange(text, custom ? id : normalizeIdentifier(text))}
      />
      <IdentifierField
        label="Community ID"
        value={id}
        maxLength={100}
        onChangeText={(text) => {
          setCustom(true);
          onChange(name, text);
        }}
      />
      <Note>
        The name is separate from the ID. IDs use lowercase letters, numbers and hyphens; spaces
        become hyphens. Choose a unique ID when creating a community.
      </Note>
    </>
  );
}
