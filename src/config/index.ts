/**
 * @packageDocumentation
 * @internal
 */
import type { BaseConfig, Configurator } from "../types"

export function createConfigurator<T extends BaseConfig>(defaults: T): Configurator<T> {
  const _defaults = defaults
  let config = defaults
  return {
    reset(): T {
      config = _defaults
      return config
    },
    get<K extends keyof T>(key: K): T[K] {
      return config[key]
    },
    getAll(): T {
      return config
    },
    set(props: Partial<T>): T {
      config = { ...config, ...props }
      return config
    },
  }
}
