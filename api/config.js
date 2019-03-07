// export const baseUrl = 'http://buyapi.lihulab.net';

export const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3010' : 'http://buybuybuy.lihulab.net'

export const config = {
    // baseUrl: 'http://buyapi.lihulab.net',
    withCredentials: true
};
