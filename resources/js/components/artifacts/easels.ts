interface EaselSpec {
    wrapperSrc: string;
    aspectRatio: string;
    overlay: { left: string; top: string; width: string; height: string };
    bordered: boolean;
}

const EASELS: Record<string, EaselSpec> = {
    frida: {
        wrapperSrc: '/wrappers/frida-easel.png',
        aspectRatio: '1456 / 1093',
        overlay: { left: '48.5%', top: '17%', width: '25.4%', height: '49.5%' },
        bordered: true,
    },
    dali: {
        wrapperSrc: '/wrappers/dali-easel.png',
        aspectRatio: '1448 / 1086',
        overlay: { left: '48%', top: '18.5%', width: '25.8%', height: '50%' },
        bordered: false,
    },
};

export function getEasel(slug: string): EaselSpec {
    return EASELS[slug] ?? EASELS.frida;
}
