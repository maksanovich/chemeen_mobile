import Titles from '@/constants/Titles';

export const getHeaderTitle = (routeName: string) => {
    return Titles[routeName] || 'Master';
}

export const getMasterListNames = (params: any[], field: string, link: string) => {
    if (link === 'PRSP') {
        return params.map((item) => {
            return {
                name: `${item.PRSPPiece} * ${item.PRSPWeight}`,
                // name: `${item.PRSPPiece} * ${item.PRSPWeight} (${item.PRSPWUnit})`,
                url: `/master/${link}/${item._id}`
            };
        });
    }

    return params.map((item) => {
        return {
            name: item[field],
            url: `/master/${link}/${item._id}`
        };
    });
}

export const convertDataPicker = (params: any[], forLabel: string, forValue: string) => {
    if (forLabel === 'PRSP') {
        return params.map((item) => {
            return {
                label: `${item.PRSPPiece} * ${item.PRSPWeight} (${item.PRSPWUnit})`,
                value: item[forValue],
            };
        });
    }

    return params.map((item) => {
        return {
            label: item[forLabel],
            value: item[forValue],
        }
    })
}

export const getPIList = (params: any[]) => {
    return params.map((item) => {
        return {
            PIId: item._id,
            No: item.PINo,
            PIDate: item.PIDate,
            shipDate: item.shipDate,
            country: item.loadingPortCountry,
            consigneeName: item.consigneeName,
        };
    });
}
