import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { getWeatherFunction } from './agent-utils'

// 天气工具，获取指定城市的天气信息
export function WeatherTool() {
  return tool(
    async (input: unknown) => {
      const { city } = await z.object({
        city: z.string()
      }).parseAsync(input)

      const weather = await getWeatherFunction(city)

      return weather
    },
    {
      name: 'weather_search',
      description: '获取指定城市的天气信息',
      schema: z.object({
        city: z.string().describe('指定城市名称, 如北京，上海，广州等')
      })
    }
  )
}