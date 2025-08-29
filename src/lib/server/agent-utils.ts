import { SignJWT, importPKCS8 } from 'jose';

const privateKeyString = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIEU0GvbD/GEDOckzzGet9u+FRcfg/j/LNV02PURU/Kvq
-----END PRIVATE KEY-----`;

const WHEATHER_HOST_NAME = 'https://nh78kwdy8p.re.qweatherapi.com';

/**
 * 生成天气JWT token
 * @returns 天气JWT token
 */
async function generatWheatherJWTToken(): Promise<string> {
	const header = {
		alg: 'EdDSA',
		kid: 'T6H2H9K9DT'
	};
	const iat = Math.floor(Date.now() / 1000) - 30;
	const exp = iat + 10 * 60 * 60;
	const payload = {
		sub: '2A2FJ3J3M5',
		iat,
		exp
	};
	const privateKey = await importPKCS8(privateKeyString, 'EdDSA');
	const jwt = await new SignJWT(payload).setProtectedHeader(header).sign(privateKey);
	return jwt;
}

/**
 * 获取天气信息
 * @param city 城市名称
 * @returns 天气信息
 */
export async function getWeatherFunction(city: string) {
	try {
		const token = await generatWheatherJWTToken();

		const locationInfo = await fetch(`${WHEATHER_HOST_NAME}/geo/v2/city/lookup?location=${city}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		const locationId = (await locationInfo.json()).location[0].id;

		if (!locationId) {
			return '没有找到该城市';
		}

		const response = await fetch(`${WHEATHER_HOST_NAME}/v7/weather/now?location=${locationId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error, 'error');
		return '获取天气信息失败';
	}
}
