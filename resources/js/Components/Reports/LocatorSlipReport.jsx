import { Document, Image, Page, Text, View } from "@react-pdf/renderer";

const valueOf = (value) => (value == null ? "" : String(value));

const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return valueOf(value);

    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
};

const TableRow = ({ label, value }) => (
    <View style={{ flexDirection: "row" }} wrap={false}>
        <View
            style={{
                borderBottomWidth: 1,
                borderRightWidth: 1,
                fontFamily: "Times-Bold",
                paddingHorizontal: 6,
                paddingVertical: 6,
                width: 128,
            }}
        >
            <Text>{label}</Text>
        </View>
        <View
            style={{
                borderBottomWidth: 1,
                borderRightWidth: 1,
                flex: 1,
                paddingHorizontal: 6,
                paddingVertical: 6,
                textTransform: "uppercase",
            }}
        >
            <Text>{valueOf(value)}</Text>
        </View>
    </View>
);

const Checkbox = ({ checked }) => (
    <View
        style={{
            alignItems: "center",
            borderWidth: 1,
            height: 10,
            justifyContent: "center",
            width: 10,
        }}
    >
        <Text
            style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 8,
                lineHeight: 1,
            }}
        >
            {checked ? "X" : ""}
        </Text>
    </View>
);

const LocatorSlipReport = ({ data = {} }) => (
    <Document
        author="Schools Division of the City of Ilagan"
        title="Locator Slip"
    >
        <Page
            size="A4"
            style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                fontFamily: "Times-Roman",
                fontSize: 12,
                lineHeight: 1.15,
                paddingBottom: 86,
                paddingHorizontal: 47,
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

            <Text
                style={{
                    fontFamily: "Times-Bold",
                    fontSize: 18,
                    marginBottom: 9,
                    textAlign: "center",
                    textDecoration: "underline",
                }}
            >
                LOCATOR SLIP
            </Text>

            <View
                style={{
                    borderLeftWidth: 1,
                    borderTopWidth: 1,
                    width: "100%",
                }}
            >
                <TableRow label="NAME" value={data.employee_name} />
                <TableRow
                    label="Position/Designation"
                    value={data.position}
                />
                <TableRow
                    label="Permanent Station"
                    value={data.permanent_station}
                />

                <View style={{ flexDirection: "row" }} wrap={false}>
                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderRightWidth: 1,
                            fontFamily: "Times-Bold",
                            minHeight: 43,
                            paddingHorizontal: 6,
                            paddingVertical: 6,
                            width: 128,
                        }}
                    >
                        <Text>Purpose of Travel</Text>
                        <Text
                            style={{
                                fontFamily: "Times-Roman",
                                fontSize: 9,
                            }}
                        >
                            (must be supported by attachments)
                        </Text>
                    </View>
                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderRightWidth: 1,
                            flex: 1,
                            minHeight: 43,
                            paddingHorizontal: 6,
                            paddingVertical: 6,
                            textTransform: "uppercase",
                        }}
                    >
                        <Text>{valueOf(data.purpose_of_travel)}</Text>
                    </View>
                </View>

                <View style={{ flexDirection: "row" }} wrap={false}>
                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderRightWidth: 1,
                            fontFamily: "Times-Bold",
                            paddingHorizontal: 6,
                            paddingVertical: 6,
                            width: 128,
                        }}
                    >
                        <Text>Please Check</Text>
                    </View>
                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderRightWidth: 1,
                            flex: 1,
                            paddingHorizontal: 6,
                            paddingVertical: 6,
                            textTransform: "uppercase",
                        }}
                    >
                        <View
                            style={{
                                alignItems: "center",
                                flexDirection: "row",
                                gap: 6,
                            }}
                        >
                            <Checkbox
                                checked={
                                    data.travel_type === "official_business"
                                }
                            />
                            <Text>Official Business</Text>
                            <View style={{ width: 18 }} />
                            <Checkbox
                                checked={data.travel_type === "official_time"}
                            />
                            <Text>Official Time</Text>
                        </View>
                    </View>
                </View>

                <TableRow
                    label="Date and Time"
                    value={formatDateTime(data.travel_datetime)}
                />
                <TableRow label="Destination" value={data.destination} />

                <View style={{ flexDirection: "row" }} wrap={false}>
                    <View
                        style={{
                            alignItems: "center",
                            borderBottomWidth: 1,
                            borderRightWidth: 1,
                            height: 66,
                            justifyContent: "flex-end",
                            paddingBottom: 6,
                            width: "50%",
                        }}
                    >
                        <Text>_____________________________</Text>
                        <Text>Signature of Requesting Employee</Text>
                    </View>
                    <View
                        style={{
                            alignItems: "center",
                            borderBottomWidth: 1,
                            borderRightWidth: 1,
                            height: 66,
                            justifyContent: "flex-end",
                            paddingBottom: 6,
                            width: "50%",
                        }}
                    >
                        <Text>_____________________________</Text>
                        <Text>Signature of Head of Office</Text>
                    </View>
                </View>
            </View>

            <View
                style={{
                    borderLeftWidth: 1,
                    borderTopWidth: 1,
                    marginTop: 12,
                }}
                wrap={false}
            >
                <Text
                    style={{
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        fontFamily: "Times-Bold",
                        padding: 6,
                        textAlign: "center",
                    }}
                >
                    CERTIFICATION
                </Text>
                <View
                    style={{
                        borderBottomWidth: 1,
                        borderRightWidth: 1,
                        minHeight: 116,
                        paddingHorizontal: 9,
                        paddingVertical: 10,
                    }}
                >
                    <Text>To the concerned:</Text>
                    <Text style={{ marginTop: 10 }}>
                        This is to certify that the above-named DepEd
                        official/personnel has visited or appeared in this
                        Office/place for the purpose and during the date and
                        time stated above.
                    </Text>
                    <Text
                        style={{
                            alignSelf: "flex-end",
                            lineHeight: 1.5,
                            marginTop: 22,
                            width: 260,
                        }}
                    >
                        Name and Signature:{"\n"}
                        Position/Designation:{"\n"}
                        Office:
                    </Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default LocatorSlipReport;
