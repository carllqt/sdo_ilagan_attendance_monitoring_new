const clean = (value) =>
    String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();

const isExtensionName = (value) =>
    /^(jr|sr|ii|iii|iv|v)\.?$/i.test(clean(value));

const takeExtensionName = (tokens) => {
    const last = tokens[tokens.length - 1] || "";
    return isExtensionName(last) ? tokens.pop() : "";
};

const getMiddleInitial = (value) => {
    const middleName = clean(value).replace(/\.+$/, "");
    const initial = Array.from(middleName)[0];

    return initial ? initial.toUpperCase() + "." : "";
};

export const getPrintedEmployeeNameParts = (
    person,
    { parsePlainName = false } = {},
) => {
    if (person && typeof person === "object") {
        const firstName = clean(person.first_name ?? person.firstName);
        const middleName = clean(person.middle_name ?? person.middleName);
        const lastName = clean(person.last_name ?? person.lastName);
        const extensionName = clean(
            person.extension_name ?? person.extensionName,
        );

        if (firstName || middleName || lastName || extensionName) {
            return {
                firstName,
                middleInitial: getMiddleInitial(middleName),
                lastName,
                extensionName,
                rawName: "",
            };
        }

        person =
            person.full_name ??
            person.fullName ??
            person.employee_name ??
            person.employeeName ??
            person.name ??
            "";
    }

    const rawName = clean(person);
    if (!rawName) {
        return {
            firstName: "",
            middleInitial: "",
            lastName: "",
            extensionName: "",
            rawName: "",
        };
    }

    const commaIndex = rawName.indexOf(",");
    if (commaIndex >= 0) {
        const lastName = clean(rawName.slice(0, commaIndex));
        const tokens = clean(rawName.slice(commaIndex + 1))
            .replace(/,/g, " ")
            .split(" ")
            .filter(Boolean);
        const extensionName = takeExtensionName(tokens);
        const firstName = tokens.shift() || "";
        const middleName = tokens.join(" ");

        return {
            firstName,
            middleInitial: getMiddleInitial(middleName),
            lastName,
            extensionName,
            rawName: "",
        };
    }

    if (!parsePlainName) {
        return {
            firstName: "",
            middleInitial: "",
            lastName: "",
            extensionName: "",
            rawName,
        };
    }

    const tokens = rawName.split(" ");
    const extensionName = takeExtensionName(tokens);
    const firstName = tokens.shift() || "";
    const lastName = tokens.length > 1 ? tokens.pop() : "";
    const middleName = tokens.join(" ");

    return {
        firstName,
        middleInitial: getMiddleInitial(middleName),
        lastName,
        extensionName,
        rawName: "",
    };
};

export const formatPrintedEmployeeName = (person, options) => {
    const parts = getPrintedEmployeeNameParts(person, options);

    if (parts.rawName) return parts.rawName;

    return [
        parts.firstName,
        parts.middleInitial,
        parts.lastName,
        parts.extensionName,
    ]
        .filter(Boolean)
        .join(" ");
};