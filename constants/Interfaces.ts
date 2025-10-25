/////////////// Master
interface IMaster {
    name: string;
    url: string;
}

interface IPicker {
    label: string;
    value: string;
}
interface ICompany {
    type: string;
    companyName: string;
    approvalNo: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone: string;
    mobile: string;
    email: string;
};
interface IBank {
    bankName: string;
    acNo: string;
    swift: string;
    IFSCCode: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone: string;
    mobile: string;
    email: string;
};
interface IPort {
    portName: string;
    country: string;
};
interface IPRF {
    PRFName: string;
    HSN: string;
};
interface IPRS {
    PRFId: string;
    PRSName: string;
    scientificName: string;
};
interface IPRST {
    PRSTName: string;
};
interface IPRSPW {
    PRSPWUnit: string;
};
interface IPRSPWS {
    PRSPWSStyle: string;
};
interface IPRSV {
    PRSVDesc: string;
};
interface IPRSPS {
    PRSPSDesc: string;
};
interface IPRSG {
    PRSPSId: string;
    PRSGDesc: string;
};
interface IPRSP {
    PRSPPiece: string;
    PRSPWeight: string;
    PRSPWId: string;
    PRSPWSId: string;
};
interface ITest {
    testDesc: string;
};
interface ITestParameters {
    testId: string;
    testParams: string;
    detectionLimit: string;
};

/////////////////// Product
interface IPI {
    PINo: string;
    PIDate: string;
    GSTIn: string;
    PONumber: string;
    POQuality: string,
    shipDate: string;
    exporterId: number;
    processorId: number;
    consigneeId: number;
    bankId: number;
    TDP: string;
    loadingPortId: number;
    dischargePortId: number;
};

interface IItem { 
    marksNo: string;
    PRFId: number;
    PRSId: number;
    PRSTId: number;
    PRSPId: number;
    PRSVId: number;
    PRSPSId: number;
}

interface IPIDetail {
    PRSGId: string;
    size: string;
    cartons: string;
    kgQty: string;
    usdRate: string;
    usdAmount: string;
}

interface IPIItem {
    PIId: string,
    No: string,
    PIDate: string,
    shipDate: string,
    country: string
}

interface IElisa {
    PIId: string;
    pdfId: string;
    testReportNo: string,
    testReportDate: string,
    rawMeterialDate: string,
    code: string,
    productionCode: string,
    sampleDrawnBy: string,
    sampleId: string,
    rawMaterialType: string,
    rawMaterialReceived: string,
    pondId: string,
    samplingDate: string,
    samplingReceiptDate: string,
    testedBy: string,
}

export {
    IMaster,
    IPicker,
    ICompany,
    IBank,
    IPort,
    IPRF,
    IPRS,
    IPRST,
    IPRSPW,
    IPRSPWS,
    IPRSV,
    IPRSPS,
    IPRSG,
    IPRSP,
    ITest,
    ITestParameters,

    IPI,
    IItem,
    IPIDetail,
    IPIItem,
    IElisa
}