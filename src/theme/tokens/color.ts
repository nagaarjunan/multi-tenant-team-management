import { rgbAlpha } from "@/utils/theme";
import { ThemeColorPresets } from "#/enum";

export const presetsColors = {
	[ThemeColorPresets.Default]: {
		lighter: "#EAF0FF",
		light: "#3157E8",
		default: "#0636D6",
		dark: "#052DB8",
		darker: "#021B78",
	},
	[ThemeColorPresets.Cyan]: {
		lighter: "#CCF4FE",
		light: "#68CDF9",
		default: "#078DEE",
		dark: "#0351AB",
		darker: "#012972",
	},
	[ThemeColorPresets.Purple]: {
		lighter: "#EBD6FD",
		light: "#B985F4",
		default: "#7635DC",
		dark: "#431A9E",
		darker: "#200A69",
	},
	[ThemeColorPresets.Blue]: {
		lighter: "#D1E9FC",
		light: "#76B0F1",
		default: "#2065D1",
		dark: "#103996",
		darker: "#061B64",
	},
	[ThemeColorPresets.Orange]: {
		lighter: "#FEF4D4",
		light: "#FED680",
		default: "#FDA92D",
		dark: "#B66816",
		darker: "#793908",
	},
	[ThemeColorPresets.Red]: {
		lighter: "#FFE3D5",
		light: "#FF9882",
		default: "#FF3030",
		dark: "#B71833",
		darker: "#7A0930",
	},
};

/**
 * We recommend picking colors with these values for [Eva Color Design](https://colors.eva.design/):
 *  + lighter : 100
 *  + light : 300
 *  + main : 500
 *  + dark : 700
 *  + darker : 900
 */
export const paletteColors = {
	primary: presetsColors[ThemeColorPresets.Default],
	success: {
		lighter: "#D8FBDE",
		light: "#86E8AB",
		default: "#36B37E",
		dark: "#1B806A",
		darker: "#0A5554",
	},
	warning: {
		lighter: "#FFF5CC",
		light: "#FFD666",
		default: "#FFAB00",
		dark: "#B76E00",
		darker: "#7A4100",
	},
	error: {
		lighter: "#FFE9D5",
		light: "#FFAC82",
		default: "#FF5630",
		dark: "#B71D18",
		darker: "#7A0916",
	},
	info: {
		lighter: "#CAFDF5",
		light: "#61F3F3",
		default: "#00B8D9",
		dark: "#006C9C",
		darker: "#003768",
	},
	gray: {
		"100": "#F8FAFC",
		"200": "#F1F5F9",
		"300": "#E2E8F0",
		"400": "#CBD5E1",
		"500": "#94A3B8",
		"600": "#64748B",
		"700": "#475569",
		"800": "#0F172A",
		"900": "#020617",
	},
};

export const commonColors = {
	white: "#FFFFFF",
	black: "#0F172A",
};

export const actionColors = {
	hover: rgbAlpha(paletteColors.gray[500], 0.1),
	selected: rgbAlpha(paletteColors.gray[500], 0.1),
	focus: rgbAlpha(paletteColors.gray[500], 0.12),
	disabled: rgbAlpha(paletteColors.gray[500], 0.48),
	active: rgbAlpha(paletteColors.gray[500], 1),
};

export const lightColorTokens = {
	palette: paletteColors,
	common: commonColors,
	action: actionColors,
	text: {
		primary: paletteColors.gray[800],
		secondary: paletteColors.gray[600],
		disabled: paletteColors.gray[500],
	},
	background: {
		default: "#F8FAFC",
		paper: commonColors.white,
		neutral: "#F1F5F9",
	},
};

export const darkColorTokens = {
	palette: paletteColors,
	common: commonColors,
	action: actionColors,
	text: {
		primary: commonColors.white,
		secondary: paletteColors.gray[500],
		disabled: paletteColors.gray[600],
	},
	background: {
		default: commonColors.black,
		paper: commonColors.black,
		neutral: "#27272A",
	},
};
