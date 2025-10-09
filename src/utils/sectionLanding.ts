export type SectionLandingLayout = 'centered' | 'left-aligned';
export type SectionLandingHeaderSize = 'sm' | 'md' | 'lg';
export type SectionLandingMaxWidth =
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | 'full';
export type SectionLandingPadding = 'none' | 'narrow' | 'wide';
export type SectionLandingCountVariant = 'accent' | 'plain';

export interface SectionLandingPreset {
    layout: SectionLandingLayout;
    headerSize: SectionLandingHeaderSize;
    headerMaxWidth: SectionLandingMaxWidth;
    padding: SectionLandingPadding;
    countVariant?: SectionLandingCountVariant;
}

export type SectionLandingPresetName = 'default' | 'plainCount';

const basePreset: SectionLandingPreset = {
    layout: 'centered',
    headerSize: 'lg',
    headerMaxWidth: '7xl',
    padding: 'none'
};

const presetMap: Record<SectionLandingPresetName, SectionLandingPreset> = {
    default: basePreset,
    plainCount: {
        ...basePreset,
        countVariant: 'plain'
    }
};

export function createSectionLandingProps<T extends Record<string, unknown>>(
    overrides: T,
    preset: SectionLandingPresetName = 'default'
): SectionLandingPreset & T {
    const presetProps = presetMap[preset] ?? presetMap.default;

    return {
        ...presetProps,
        ...overrides
    };
}
