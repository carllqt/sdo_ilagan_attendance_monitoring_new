import { Document, Image, Page, Text, View } from "@react-pdf/renderer";

const rows = [
    ["NAME", "employee_name"],
    ["Position/Designation", "position"],
    ["Permanent Station", "permanent_station"],
    ["Purpose of Travel", "purpose_of_travel"],
    ["Host of Activity", "host_of_activity"],
    ["Inclusive Dates", "inclusive_dates"],
    ["Destination", "destination"],
    ["Fund Source", "fund_source"],
];

const valueOf = (value) => (value == null ? "" : String(value));

const formatDate = (value) => {
    if (!value) return "";

    const rawValue = String(value).slice(0, 10);
    const date = new Date(`${rawValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) return valueOf(value);

    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

const SignatureBlock = ({
    caption,
    name,
    style,
    matchTitleUnderline = false,
}) => (
    <View
        style={[
            {
                alignItems: "flex-start",
                flexDirection: "row",
                marginTop: 11,
            },
            style,
        ]}
    >
        <View
            style={{
                flex: 1,
                paddingHorizontal: 4,
                textAlign: "center",
            }}
        >
            <View
                style={{
                    alignSelf: "center",
                    borderBottomWidth: matchTitleUnderline ? 1 : 0,
                    position: "relative",
                    top: -2,
                }}
            >
                <Text
                    style={{
                        fontFamily: "Times-Bold",
                        fontSize: 11,
                        textAlign: "center",
                        textDecoration: matchTitleUnderline
                            ? "none"
                            : "underline",
                    }}
                >
                    {name}
                </Text>
            </View>
            <Text
                style={{
                    fontSize: 11,
                    lineHeight: 1.05,
                    textAlign: "center",
                }}
            >
                {caption}
            </Text>
        </View>
        <View
            style={{
                paddingHorizontal: 4,
                textAlign: "center",
                width: 130,
            }}
        >
            <Text
                style={{
                    fontFamily: "Times-Bold",
                    fontSize: 11,
                    textAlign: "center",
                }}
            >
                ____________________
            </Text>
            <Text
                style={{
                    fontSize: 11,
                    lineHeight: 1.05,
                    textAlign: "center",
                }}
            >
                Date
            </Text>
        </View>
    </View>
);

const TravelOrderReport = ({ data = {} }) => (
    <Document
        author="Schools Division of the City of Ilagan"
        title="Travel Order"
    >
        <Page
            size="A4"
            style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                fontFamily: "Times-Roman",
                fontSize: 12,
                lineHeight: 1.1,
                paddingBottom: 86,
                paddingHorizontal: 72,
                paddingTop: 162,
            }}
        >
            <Image
                fixed
                src="/images/document-template/sdo-header.png"
                style={{
                    height: 160,
                    left: 0,
                    position: "absolute",
                    top: 0,
                    width: "100%",
                }}
            />
            <Image
                fixed
                src="/images/document-template/sdo-footer.png"
                style={{
                    bottom: 9,
                    height: 71,
                    left: 0,
                    position: "absolute",
                    width: "100%",
                }}
            />

            <View
                style={{
                    alignSelf: "flex-end",
                    borderWidth: 1,
                    flexDirection: "row",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    width: 140,
                    marginTop: -10,
                    marginBottom: 8,
                }}
                wrap={false}
            >
                <Text
                    style={{
                        fontFamily: "Times-Bold",
                        fontSize: 8.5,
                    }}
                >
                    No:
                </Text>
                <View
                    style={{
                        flex: 1,
                        height: 10,
                        position: "relative",
                    }}
                >
                    <Text
                        style={{
                            fontFamily: "Times-Bold",
                            fontSize: 8.5,
                            lineHeight: 1,
                            textAlign: "right",
                        }}
                    >
                        , s.2026
                    </Text>
                    <View
                        style={{
                            borderTopWidth: 1,
                            left: 0,
                            position: "absolute",
                            right: 0,
                            top: 10,
                        }}
                    />
                </View>
            </View>

            <Text
                style={{
                    fontFamily: "Times-Bold",
                    fontSize: 14,
                    marginBottom: 7,
                    textAlign: "center",
                    textDecoration: "underline",
                }}
            >
                TRAVEL AUTHORITY FOR OFFICIAL LOCAL TRAVEL
            </Text>

            <View
                style={{
                    borderLeftWidth: 1,
                    borderTopWidth: 1,
                    width: "100%",
                    marginTop: 12,
                }}
            >
                {rows.map(([label, field], index) => (
                    <View
                        key={field}
                        style={{
                            flexDirection: "row",
                            minHeight: index === 0 ? 20 : 27,
                        }}
                        wrap={false}
                    >
                        <View
                            style={{
                                borderBottomWidth: 1,
                                borderRightWidth: 1,
                                fontFamily: "Times-Bold",
                                justifyContent: "center",
                                paddingHorizontal: 5,
                                paddingVertical: 3,
                                width: 142,
                            }}
                        >
                            <Text>{label}</Text>
                            {field === "purpose_of_travel" && (
                                <Text
                                    style={{
                                        fontFamily: "Times-Roman",
                                        fontSize: 8,
                                    }}
                                >
                                    (must be supported by attachments)
                                </Text>
                            )}
                        </View>
                        <View
                            style={{
                                borderBottomWidth: 1,
                                borderRightWidth: 1,
                                flex: 1,
                                justifyContent: "center",
                                paddingHorizontal: 5,
                                paddingVertical: 3,
                            }}
                        >
                            <Text
                                style={
                                    field === "employee_name"
                                        ? { textTransform: "uppercase" }
                                        : null
                                }
                            >
                                {field === "inclusive_dates"
                                    ? formatDate(data[field])
                                    : valueOf(data[field])}
                            </Text>
                        </View>
                    </View>
                ))}

                <View
                    style={{
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        minHeight: 83,
                        paddingHorizontal: 7,
                        paddingVertical: 6,
                        width: "100%",
                    }}
                    wrap={false}
                >
                    <Text
                        style={{
                            fontFamily: "Times-Italic",
                            fontSize: 9,
                            lineHeight: 1.15,
                        }}
                    >
                        I hereby attest that the information in this form and in
                        the supporting documents attached hereto are true and
                        correct.
                    </Text>
                    <SignatureBlock
                        caption="Name and Signature of Requesting Employee"
                        name={valueOf(data.employee_name).toUpperCase()}
                        style={{ marginTop: 24 }}
                        matchTitleUnderline
                    />
                </View>

                <View
                    style={{
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        minHeight: 85,
                        paddingHorizontal: 7,
                        paddingVertical: 6,
                        width: "100%",
                    }}
                    wrap={false}
                >
                    <Text
                        style={{
                            fontFamily: "Times-Italic",
                            fontSize: 9,
                            lineHeight: 1.15,
                        }}
                    >
                        This is to certify that the trip of the requesting
                        employee satisfies all the minimum conditions for
                        authorized official travel and that alternatives to
                        travel are insufficient for purpose stated herein.
                    </Text>
                    <SignatureBlock
                        caption="Assistant Schools Division Superintendent"
                        name="CHERYL R. RAMIRO, PhD, CESO VI"
                        style={{ marginTop: 24 }}
                        matchTitleUnderline
                    />
                </View>

                <View
                    style={{
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        minHeight: 85,
                        paddingHorizontal: 7,
                        paddingVertical: 6,
                        width: "100%",
                    }}
                    wrap={false}
                >
                    <Text
                        style={{
                            fontFamily: "Times-Bold",
                            fontSize: 8,
                        }}
                    >
                        APPROVED:
                    </Text>
                    <SignatureBlock
                        caption="Schools Division Superintendent"
                        name="EDUARDO C. ESCORPISO JR., EdD, CESO V"
                        style={{ marginTop: 24 }}
                        matchTitleUnderline
                    />
                </View>
            </View>
        </Page>
    </Document>
);

export default TravelOrderReport;
