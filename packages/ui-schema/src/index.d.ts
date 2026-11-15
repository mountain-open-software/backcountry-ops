import type {FormDefinition} from '@open-mountain/domain';
export const screens: Record<string, FormDefinition & {title: string; singular: string}>;
export function validateScreen(screen: FormDefinition): FormDefinition;
