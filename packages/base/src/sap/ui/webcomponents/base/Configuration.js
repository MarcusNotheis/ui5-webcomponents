import Device from "@ui5/webcomponents-core/dist/sap/ui/Device";
import LocaleData from "@ui5/webcomponents-core/dist/sap/ui/core/LocaleData";
import Locale from "@ui5/webcomponents-core/dist/sap/ui/core/Locale";
import CalendarType from "@ui5/webcomponents-core/dist/sap/ui/core/CalendarType";
import FormatSettings from "./FormatSettings";

const getDesigntimePropertyAsArray = sValue => {
	const m = /\$([-a-z0-9A-Z._]+)(?::([^$]*))?\$/.exec(sValue);
	return (m && m[2]) ? m[2].split(/,/) : null;
};

const supportedLanguages = getDesigntimePropertyAsArray("$core-i18n-locales:,ar,bg,ca,cs,da,de,el,en,es,et,fi,fr,hi,hr,hu,it,iw,ja,ko,lt,lv,nl,no,pl,pt,ro,ru,sh,sk,sl,sv,th,tr,uk,vi,zh_CN,zh_TW$");

const detectLanguage = () => {
	const browserLanguages = navigator.languages;

	const navigatorLanguage = () => {
		if (Device.os.android) {
			// on Android, navigator.language is hardcoded to 'en', so check UserAgent string instead
			const match = navigator.userAgent.match(/\s([a-z]{2}-[a-z]{2})[;)]/i);
			if (match) {
				return match[1];
			}
			// okay, we couldn't find a language setting. It might be better to fallback to 'en' instead of having no language
		}
		return navigator.language;
	};

	const rawLocale = (browserLanguages && browserLanguages[0]) || navigatorLanguage() || navigator.userLanguage || navigator.browserLanguage;

	return rawLocale || "en";
};

const language = detectLanguage();

const CONFIGURATION = {
	theme: "sap_fiori_3",
	rtl: null,
	language: new Locale(language),
	compactSize: false,
	supportedLanguages,
	calendarType: null,
	derivedRTL: null,
	"xx-wc-force-default-gestures": false,
	"xx-wc-no-conflict": false, // no URL
};

const formatSettings = new FormatSettings(CONFIGURATION);

/* General settings */
const getTheme = () => {
	return CONFIGURATION.theme;
};

const getRTL = () => {
	return CONFIGURATION.rtl === null ? CONFIGURATION.derivedRTL : CONFIGURATION.rtl;
};

const getLanguage = () => {
	return CONFIGURATION.language.sLocaleId;
};

const getCompactSize = () => {
	return CONFIGURATION.compactSize;
};

const getSupportedLanguages = () => {
	return CONFIGURATION.supportedLanguages;
};

/* WC specifics */
const getWCForceDefaultGestures = () => {
	return CONFIGURATION["xx-wc-force-default-gestures"];
};

const getWCNoConflict = () => {
	return CONFIGURATION["xx-wc-no-conflict"];
};

/* Calendar stuff */
const getCalendarType = () => {
	if (CONFIGURATION.calendarType) {
		const type = Object.keys(CalendarType).filter(calType => calType === CONFIGURATION.calendarType)[0];

		if (type) {
			return type;
		}
	}

	return LocaleData.getInstance(getLocale()).getPreferredCalendarType();
};

const getOriginInfo = () => {};

const getLocale = () => {
	return CONFIGURATION.language;
};

const getFormatSettings = () => {
	return formatSettings;
};

const _setTheme = themeName => {
	CONFIGURATION.theme = themeName;
};

const applyURLParameters = () => {
	const fullURL = window.location.href;
	const params = new URL(fullURL);
	const searchParams = params.searchParams;
	const langValue = searchParams.get("sap-ui-language");
	const theme = searchParams.get("sap-ui-theme");
	const rtl = searchParams.get("sap-ui-rtl");
	const compactSize = searchParams.get("sap-ui-compactSize");
	const calendarType = searchParams.get("sap-ui-calendarType");
	const forceDefaultGestures = searchParams.get("xx-wc-force-default-gestures");

	if (langValue) {
		setLanguage(langValue);
	}

	if (theme) {
		CONFIGURATION.theme = theme;
	}

	if (rtl !== null) {
		CONFIGURATION.rtl = !(rtl === "false");
	}

	if (compactSize !== null) {
		CONFIGURATION.compactSize = !(compactSize === "false");
	}

	if (calendarType && calendarType !== CONFIGURATION.calendarType) {
		CONFIGURATION.calendarType = calendarType;
	}

	if (forceDefaultGestures !== null) {
		CONFIGURATION["xx-wc-force-default-gestures"] = !(forceDefaultGestures === "false");
	}
};

const convertToLocaleOrNull = lang => {
	try {
		if (lang && typeof lang === "string") {
			return new Locale(lang);
		}
	} catch (e) {
		// ignore
	}
};

const check = (condition, sMessage) => {
	if (!condition) {
		throw new Error(sMessage);
	}
};

const getLanguageTag = () => {
	return CONFIGURATION.language.toString();
};

const setLanguage = newLanguage => {
	const locale = convertToLocaleOrNull(newLanguage);

	check(locale, "Configuration.setLanguage: newLanguage must be a valid BCP47 language tag");

	if (locale.toString() !== getLanguageTag()) {
		CONFIGURATION.language = locale;
		CONFIGURATION.derivedRTL = Locale._impliesRTL(locale);
	}

	return CONFIGURATION;
};

const applyConfigurationScript = () => {
	const configScript = document.querySelector("[data-id='sap-ui-config']");
	let configJSON;

	if (configScript) {
		try {
			configJSON = JSON.parse(configScript.innerHTML);
		} catch (е) {
			console.warn("Incorrect data-sap-ui-config format. Please use JSON"); /* eslint-disable-line */
		}

		if (configJSON) {
			const langParam = configJSON.language;
			const theme = configJSON.theme;
			const rtl = configJSON.rtl;
			const compactSize = configJSON.compactSize;
			const calendarType = configJSON.calendarType;
			const noConflictAPIs = configJSON["xx-wc-no-conflict"];
			const forceDefaultGestures = configJSON["xx-wc-force-default-gestures"];

			if (langParam) {
				setLanguage(langParam);
			}

			if (theme) {
				CONFIGURATION.theme = theme;
			}

			if (rtl !== undefined) {
				CONFIGURATION.rtl = !!rtl;
			}

			if (compactSize !== undefined) {
				CONFIGURATION.compactSize = !!compactSize;
			}

			if (noConflictAPIs !== undefined) {
				CONFIGURATION["xx-wc-no-conflict"] = !!noConflictAPIs;
			}

			if (forceDefaultGestures !== undefined) {
				CONFIGURATION["xx-wc-force-default-gestures"] = !!forceDefaultGestures;
			}

			if (calendarType && calendarType !== CONFIGURATION.calendarType) {
				CONFIGURATION.calendarType = calendarType;
			}
		}
	}
};

applyConfigurationScript();
applyURLParameters();

export {
	getTheme,
	getRTL,
	getLanguage,
	getCompactSize,
	getWCForceDefaultGestures,
	getWCNoConflict,
	getCalendarType,
	getLocale,
	getFormatSettings,
	_setTheme,
	getSupportedLanguages,
	getOriginInfo,
};
