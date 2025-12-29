// language.types.ts
// Baidu 机器翻译（文本翻译-通用版）语种类型与数据（含 Naive UI n-select options）

import type { SelectGroupOption, SelectOption } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'

export const BAIDU_MT_LANG_INITIALS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'W',
  'X',
  'Y',
  'Z',
] as const

export type BaiduMtLangInitial = (typeof BAIDU_MT_LANG_INITIALS)[number]

export interface BaiduMtLanguageItem {
  readonly initial: BaiduMtLangInitial
  readonly code: string
  readonly name: string
  readonly detectable: boolean
}

/** 语种列表（唯一真源） */
export const BAIDU_MT_LANGUAGES = [
  // A
  { initial: 'A', name: '阿拉伯语', code: 'ara', detectable: true },
  { initial: 'A', name: '爱尔兰语', code: 'gle', detectable: true },
  { initial: 'A', name: '奥克语', code: 'oci', detectable: true },
  { initial: 'A', name: '阿尔巴尼亚语', code: 'alb', detectable: true },
  { initial: 'A', name: '阿尔及利亚阿拉伯语', code: 'arq', detectable: false },
  { initial: 'A', name: '阿肯语', code: 'aka', detectable: false },
  { initial: 'A', name: '阿拉贡语', code: 'arg', detectable: false },
  { initial: 'A', name: '阿姆哈拉语', code: 'amh', detectable: true },
  { initial: 'A', name: '阿萨姆语', code: 'asm', detectable: true },
  { initial: 'A', name: '艾马拉语', code: 'aym', detectable: false },
  { initial: 'A', name: '阿塞拜疆语', code: 'aze', detectable: true },
  { initial: 'A', name: '阿斯图里亚斯语', code: 'ast', detectable: true },
  { initial: 'A', name: '奥塞梯语', code: 'oss', detectable: false },
  { initial: 'A', name: '爱沙尼亚语', code: 'est', detectable: true },
  { initial: 'A', name: '奥杰布瓦语', code: 'oji', detectable: false },
  { initial: 'A', name: '奥里亚语', code: 'ori', detectable: true },
  { initial: 'A', name: '奥罗莫语', code: 'orm', detectable: false },

  // B
  { initial: 'B', name: '波兰语', code: 'pl', detectable: true },
  { initial: 'B', name: '波斯语', code: 'per', detectable: true },
  { initial: 'B', name: '布列塔尼语', code: 'bre', detectable: true },
  { initial: 'B', name: '巴什基尔语', code: 'bak', detectable: false },
  { initial: 'B', name: '巴斯克语', code: 'baq', detectable: true },
  { initial: 'B', name: '巴西葡萄牙语', code: 'pot', detectable: false },
  { initial: 'B', name: '白俄罗斯语', code: 'bel', detectable: true },
  { initial: 'B', name: '柏柏尔语', code: 'ber', detectable: true },
  { initial: 'B', name: '邦板牙语', code: 'pam', detectable: false },
  { initial: 'B', name: '保加利亚语', code: 'bul', detectable: true },
  { initial: 'B', name: '北方萨米语', code: 'sme', detectable: false },
  { initial: 'B', name: '北索托语', code: 'ped', detectable: false },
  { initial: 'B', name: '本巴语', code: 'bem', detectable: false },
  { initial: 'B', name: '比林语', code: 'bli', detectable: false },
  { initial: 'B', name: '比斯拉马语', code: 'bis', detectable: false },
  { initial: 'B', name: '俾路支语', code: 'bal', detectable: false },
  { initial: 'B', name: '冰岛语', code: 'ice', detectable: true },
  { initial: 'B', name: '波斯尼亚语', code: 'bos', detectable: true },
  { initial: 'B', name: '博杰普尔语', code: 'bho', detectable: false },

  // C
  { initial: 'C', name: '楚瓦什语', code: 'chv', detectable: false },
  { initial: 'C', name: '聪加语', code: 'tso', detectable: false },

  // D
  { initial: 'D', name: '丹麦语', code: 'dan', detectable: true },
  { initial: 'D', name: '德语', code: 'de', detectable: true },
  { initial: 'D', name: '鞑靼语', code: 'tat', detectable: true },
  { initial: 'D', name: '掸语', code: 'sha', detectable: false },
  { initial: 'D', name: '德顿语', code: 'tet', detectable: false },
  { initial: 'D', name: '迪维希语', code: 'div', detectable: false },
  { initial: 'D', name: '低地德语', code: 'log', detectable: true },

  // E
  { initial: 'E', name: '俄语', code: 'ru', detectable: true },

  // F
  { initial: 'F', name: '法语', code: 'fra', detectable: true },
  { initial: 'F', name: '菲律宾语', code: 'fil', detectable: true },
  { initial: 'F', name: '芬兰语', code: 'fin', detectable: true },
  { initial: 'F', name: '梵语', code: 'san', detectable: false },
  { initial: 'F', name: '弗留利语', code: 'fri', detectable: false },
  { initial: 'F', name: '富拉尼语', code: 'ful', detectable: false },
  { initial: 'F', name: '法罗语', code: 'fao', detectable: false },

  // G
  { initial: 'G', name: '盖尔语', code: 'gla', detectable: false },
  { initial: 'G', name: '刚果语', code: 'kon', detectable: false },
  { initial: 'G', name: '高地索布语', code: 'ups', detectable: false },
  { initial: 'G', name: '高棉语', code: 'hkm', detectable: true },
  { initial: 'G', name: '格陵兰语', code: 'kal', detectable: false },
  { initial: 'G', name: '格鲁吉亚语', code: 'geo', detectable: true },
  { initial: 'G', name: '古吉拉特语', code: 'guj', detectable: true },
  { initial: 'G', name: '古希腊语', code: 'gra', detectable: false },
  { initial: 'G', name: '古英语', code: 'eno', detectable: false },
  { initial: 'G', name: '瓜拉尼语', code: 'grn', detectable: false },

  // H
  { initial: 'H', name: '韩语', code: 'kor', detectable: true },
  { initial: 'H', name: '荷兰语', code: 'nl', detectable: true },
  { initial: 'H', name: '胡帕语', code: 'hup', detectable: false },
  { initial: 'H', name: '哈卡钦语', code: 'hak', detectable: false },
  { initial: 'H', name: '海地语', code: 'ht', detectable: false },
  { initial: 'H', name: '黑山语', code: 'mot', detectable: false },
  { initial: 'H', name: '豪萨语', code: 'hau', detectable: false },

  // J
  { initial: 'J', name: '吉尔吉斯语', code: 'kir', detectable: false },
  { initial: 'J', name: '加利西亚语', code: 'glg', detectable: true },
  { initial: 'J', name: '加拿大法语', code: 'frn', detectable: false },
  { initial: 'J', name: '加泰罗尼亚语', code: 'cat', detectable: true },
  { initial: 'J', name: '捷克语', code: 'cs', detectable: true },

  // K
  { initial: 'K', name: '卡拜尔语', code: 'kab', detectable: true },
  { initial: 'K', name: '卡纳达语', code: 'kan', detectable: true },
  { initial: 'K', name: '卡努里语', code: 'kau', detectable: false },
  { initial: 'K', name: '卡舒比语', code: 'kah', detectable: false },
  { initial: 'K', name: '康瓦尔语', code: 'cor', detectable: false },
  { initial: 'K', name: '科萨语', code: 'xho', detectable: true },
  { initial: 'K', name: '科西嘉语', code: 'cos', detectable: false },
  { initial: 'K', name: '克里克语', code: 'cre', detectable: false },
  { initial: 'K', name: '克里米亚鞑靼语', code: 'cri', detectable: false },
  { initial: 'K', name: '克林贡语', code: 'kli', detectable: false },
  { initial: 'K', name: '克罗地亚语', code: 'hrv', detectable: true },
  { initial: 'K', name: '克丘亚语', code: 'que', detectable: false },
  { initial: 'K', name: '克什米尔语', code: 'kas', detectable: false },
  { initial: 'K', name: '孔卡尼语', code: 'kok', detectable: false },
  { initial: 'K', name: '库尔德语', code: 'kur', detectable: true },

  // L
  { initial: 'L', name: '拉丁语', code: 'lat', detectable: true },
  { initial: 'L', name: '老挝语', code: 'lao', detectable: false },
  { initial: 'L', name: '罗马尼亚语', code: 'rom', detectable: true },
  { initial: 'L', name: '拉特加莱语', code: 'lag', detectable: false },
  { initial: 'L', name: '拉脱维亚语', code: 'lav', detectable: true },
  { initial: 'L', name: '林堡语', code: 'lim', detectable: false },
  { initial: 'L', name: '林加拉语', code: 'lin', detectable: false },
  { initial: 'L', name: '卢干达语', code: 'lug', detectable: false },
  { initial: 'L', name: '卢森堡语', code: 'ltz', detectable: false },
  { initial: 'L', name: '卢森尼亚语', code: 'ruy', detectable: false },
  { initial: 'L', name: '卢旺达语', code: 'kin', detectable: true },
  { initial: 'L', name: '立陶宛语', code: 'lit', detectable: true },
  { initial: 'L', name: '罗曼什语', code: 'roh', detectable: false },
  { initial: 'L', name: '罗姆语', code: 'ro', detectable: false },
  { initial: 'L', name: '逻辑语', code: 'loj', detectable: false },

  // M
  { initial: 'M', name: '马来语', code: 'may', detectable: true },
  { initial: 'M', name: '缅甸语', code: 'bur', detectable: true },
  { initial: 'M', name: '马拉地语', code: 'mar', detectable: false },
  { initial: 'M', name: '马拉加斯语', code: 'mg', detectable: true },
  { initial: 'M', name: '马拉雅拉姆语', code: 'mal', detectable: true },
  { initial: 'M', name: '马其顿语', code: 'mac', detectable: true },
  { initial: 'M', name: '马绍尔语', code: 'mah', detectable: false },
  { initial: 'M', name: '迈蒂利语', code: 'mai', detectable: true },
  { initial: 'M', name: '曼克斯语', code: 'glv', detectable: false },
  { initial: 'M', name: '毛里求斯克里奥尔语', code: 'mau', detectable: false },
  { initial: 'M', name: '毛利语', code: 'mao', detectable: false },
  { initial: 'M', name: '孟加拉语', code: 'ben', detectable: true },
  { initial: 'M', name: '马耳他语', code: 'mlt', detectable: true },
  { initial: 'M', name: '苗语', code: 'hmn', detectable: false },

  // N
  { initial: 'N', name: '挪威语', code: 'nor', detectable: true },
  { initial: 'N', name: '那不勒斯语', code: 'nea', detectable: false },
  { initial: 'N', name: '南恩德贝莱语', code: 'nbl', detectable: false },
  { initial: 'N', name: '南非荷兰语', code: 'afr', detectable: true },
  { initial: 'N', name: '南索托语', code: 'sot', detectable: false },
  { initial: 'N', name: '尼泊尔语', code: 'nep', detectable: true },

  // P
  { initial: 'P', name: '葡萄牙语', code: 'pt', detectable: true },
  { initial: 'P', name: '旁遮普语', code: 'pan', detectable: true },
  { initial: 'P', name: '帕皮阿门托语', code: 'pap', detectable: false },
  { initial: 'P', name: '普什图语', code: 'pus', detectable: false },

  // Q
  { initial: 'Q', name: '齐切瓦语', code: 'nya', detectable: false },
  { initial: 'Q', name: '契维语', code: 'twi', detectable: false },
  { initial: 'Q', name: '切罗基语', code: 'chr', detectable: false },

  // R
  { initial: 'R', name: '日语', code: 'jp', detectable: true },
  { initial: 'R', name: '瑞典语', code: 'swe', detectable: true },

  // S
  { initial: 'S', name: '萨丁尼亚语', code: 'srd', detectable: false },
  { initial: 'S', name: '萨摩亚语', code: 'sm', detectable: false },
  { initial: 'S', name: '塞尔维亚-克罗地亚语', code: 'sec', detectable: false },
  { initial: 'S', name: '塞尔维亚语', code: 'srp', detectable: true },
  { initial: 'S', name: '桑海语', code: 'sol', detectable: false },
  { initial: 'S', name: '僧伽罗语', code: 'sin', detectable: true },
  { initial: 'S', name: '世界语', code: 'epo', detectable: true },
  { initial: 'S', name: '书面挪威语', code: 'nob', detectable: true },
  { initial: 'S', name: '斯洛伐克语', code: 'sk', detectable: true },
  { initial: 'S', name: '斯洛文尼亚语', code: 'slo', detectable: true },
  { initial: 'S', name: '斯瓦希里语', code: 'swa', detectable: true },
  { initial: 'S', name: '塞尔维亚语（西里尔）', code: 'src', detectable: false },
  { initial: 'S', name: '索马里语', code: 'som', detectable: true },
  { initial: 'S', name: '苏格兰语', code: 'sco', detectable: false },

  // T
  { initial: 'T', name: '泰语', code: 'th', detectable: true },
  { initial: 'T', name: '土耳其语', code: 'tr', detectable: true },
  { initial: 'T', name: '塔吉克语', code: 'tgk', detectable: true },
  { initial: 'T', name: '泰米尔语', code: 'tam', detectable: true },
  { initial: 'T', name: '他加禄语', code: 'tgl', detectable: true },
  { initial: 'T', name: '提格利尼亚语', code: 'tir', detectable: false },
  { initial: 'T', name: '泰卢固语', code: 'tel', detectable: true },
  { initial: 'T', name: '突尼斯阿拉伯语', code: 'tua', detectable: false },
  { initial: 'T', name: '土库曼语', code: 'tuk', detectable: false },

  // W
  { initial: 'W', name: '乌克兰语', code: 'ukr', detectable: true },
  { initial: 'W', name: '瓦隆语', code: 'wln', detectable: true },
  { initial: 'W', name: '威尔士语', code: 'wel', detectable: true },
  { initial: 'W', name: '文达语', code: 'ven', detectable: false },
  { initial: 'W', name: '沃洛夫语', code: 'wol', detectable: false },
  { initial: 'W', name: '乌尔都语', code: 'urd', detectable: true },

  // X
  { initial: 'X', name: '西班牙语', code: 'spa', detectable: true },
  { initial: 'X', name: '希伯来语', code: 'heb', detectable: true },
  { initial: 'X', name: '希腊语', code: 'el', detectable: true },
  { initial: 'X', name: '匈牙利语', code: 'hu', detectable: true },
  { initial: 'X', name: '西弗里斯语', code: 'fry', detectable: true },
  { initial: 'X', name: '西里西亚语', code: 'sil', detectable: false },
  { initial: 'X', name: '希利盖农语', code: 'hil', detectable: false },
  { initial: 'X', name: '下索布语', code: 'los', detectable: false },
  { initial: 'X', name: '夏威夷语', code: 'haw', detectable: false },
  { initial: 'X', name: '新挪威语', code: 'nno', detectable: true },
  { initial: 'X', name: '西非书面语', code: 'nqo', detectable: false },
  { initial: 'X', name: '信德语', code: 'snd', detectable: false },
  { initial: 'X', name: '修纳语', code: 'sna', detectable: false },
  { initial: 'X', name: '宿务语', code: 'ceb', detectable: false },
  { initial: 'X', name: '叙利亚语', code: 'syr', detectable: false },
  { initial: 'X', name: '巽他语', code: 'sun', detectable: false },

  // Y
  { initial: 'Y', name: '英语', code: 'en', detectable: true },
  { initial: 'Y', name: '印地语', code: 'hi', detectable: true },
  { initial: 'Y', name: '印尼语', code: 'id', detectable: true },
  { initial: 'Y', name: '意大利语', code: 'it', detectable: true },
  { initial: 'Y', name: '越南语', code: 'vie', detectable: true },
  { initial: 'Y', name: '意第绪语', code: 'yid', detectable: false },
  { initial: 'Y', name: '因特语', code: 'ina', detectable: false },
  { initial: 'Y', name: '亚齐语', code: 'ach', detectable: false },
  { initial: 'Y', name: '印古什语', code: 'ing', detectable: false },
  { initial: 'Y', name: '伊博语', code: 'ibo', detectable: false },
  { initial: 'Y', name: '伊多语', code: 'ido', detectable: false },
  { initial: 'Y', name: '约鲁巴语', code: 'yor', detectable: false },
  { initial: 'Y', name: '亚美尼亚语', code: 'arm', detectable: true },
  { initial: 'Y', name: '伊努克提图特语', code: 'iku', detectable: false },

  // Z
  { initial: 'Z', name: '中文(简体)', code: 'zh', detectable: true },
  { initial: 'Z', name: '中文(繁体)', code: 'cht', detectable: true },
  { initial: 'Z', name: '中文(文言文)', code: 'wyw', detectable: true },
  { initial: 'Z', name: '中文(粤语)', code: 'yue', detectable: true },
  { initial: 'Z', name: '扎扎其语', code: 'zaz', detectable: false },
  { initial: 'Z', name: '中古法语', code: 'frm', detectable: false },
  { initial: 'Z', name: '祖鲁语', code: 'zul', detectable: false },
  { initial: 'Z', name: '爪哇语', code: 'jav', detectable: false },

  // 自动检测（文档里也作为一种“语种代码”使用）
  { initial: 'Z', name: '自动检测', code: 'auto', detectable: true },
] as const satisfies readonly BaiduMtLanguageItem[]

export type BaiduMtLangCode = (typeof BAIDU_MT_LANGUAGES)[number]['code']
export type BaiduMtLanguage = (typeof BAIDU_MT_LANGUAGES)[number]

export const BAIDU_MT_AUTO_LANG_CODE: Extract<BaiduMtLangCode, 'auto'> = 'auto'

/** 生成 code -> item 的强类型映射表（无 any） */
function buildLangMap<const T extends readonly { readonly code: string }[]>(
  list: T,
): Readonly<Record<T[number]['code'], T[number]>> {
  const out = {} as Record<T[number]['code'], T[number]>
  for (const item of list) {
    out[item.code as T[number]['code']] = item as T[number]
  }
  return out
}

export const BAIDU_MT_LANG_MAP = buildLangMap(BAIDU_MT_LANGUAGES)

export function isBaiduMtLangCode(code: string): code is BaiduMtLangCode {
  return Object.prototype.hasOwnProperty.call(BAIDU_MT_LANG_MAP, code)
}

export function getBaiduMtLangName(code: BaiduMtLangCode): string {
  return BAIDU_MT_LANG_MAP[code].name
}

export function isBaiduMtDetectable(code: BaiduMtLangCode): boolean {
  return BAIDU_MT_LANG_MAP[code].detectable
}

/** 按 initial 分组（用于 UI） */
export type BaiduMtLangGrouped = Readonly<Record<BaiduMtLangInitial, readonly BaiduMtLanguage[]>>

export function groupBaiduMtLanguages(
  list: readonly BaiduMtLanguage[] = BAIDU_MT_LANGUAGES,
): BaiduMtLangGrouped {
  const grouped = Object.fromEntries(
    BAIDU_MT_LANG_INITIALS.map((k) => [k, [] as BaiduMtLanguage[]] as const),
  ) as Record<BaiduMtLangInitial, BaiduMtLanguage[]>

  for (const item of list) grouped[item.initial].push(item)

  for (const k of BAIDU_MT_LANG_INITIALS) Object.freeze(grouped[k])
  return grouped
}

export const BAIDU_MT_LANG_GROUPED: BaiduMtLangGrouped = groupBaiduMtLanguages()

/* ----------------------------- Naive UI n-select ----------------------------- */

/** 单项 option（value 强类型） */
export type BaiduMtSelectOption = SelectOption & { value: BaiduMtLangCode }

/**
 * 分组 option（重点：children 必须是“可变数组”，否则会和 Naive 类型冲突）
 * 同时把 type 固定为字面量 'group'
 */
export type BaiduMtSelectGroupOption = Omit<SelectGroupOption, 'children' | 'type'> & {
  type: 'group'
  children: BaiduMtSelectOption[]
}

/** 扁平 options（只读：方便内部复用） */
export const BAIDU_MT_LANG_SELECT_OPTIONS_READONLY: readonly BaiduMtSelectOption[] =
  BAIDU_MT_LANGUAGES.map((x) => ({
    label: x.name,
    value: x.code,
  }))

/**
 * 扁平 options（给 <n-select :options>）
 * Naive 期望 SelectMixedOption[]（可变），这里直接生成可变数组
 */
export const BAIDU_MT_LANG_SELECT_OPTIONS: SelectMixedOption[] = BAIDU_MT_LANGUAGES.map(
  (x): BaiduMtSelectOption => ({
    label: x.name,
    value: x.code,
  }),
)

/** 分组选项（只读结构：内部可用） */
export const BAIDU_MT_LANG_SELECT_GROUP_OPTIONS_READONLY: readonly BaiduMtSelectGroupOption[] =
  BAIDU_MT_LANG_INITIALS.map((initial): BaiduMtSelectGroupOption => {
    const children: BaiduMtSelectOption[] = BAIDU_MT_LANG_GROUPED[initial].map((x) => ({
      label: x.name,
      value: x.code,
    }))

    return {
      type: 'group',
      label: initial,
      key: initial,
      children,
    }
  }).filter((g) => g.children.length > 0)

/**
 * 分组选项（给 <n-select :options>）
 * 这里再生成一次，确保 options/children 都是可变数组，且类型完全匹配 Naive
 */
export const BAIDU_MT_LANG_SELECT_GROUP_OPTIONS: SelectMixedOption[] =
  BAIDU_MT_LANG_INITIALS.reduce<SelectMixedOption[]>((acc, initial) => {
    const group = BAIDU_MT_LANG_SELECT_GROUP_OPTIONS_READONLY.find((g) => g.label === initial)
    if (!group) return acc

    const item: BaiduMtSelectGroupOption = {
      type: 'group',
      label: String(group.label),
      key: group.key,
      children: group.children.map((c) => ({ label: c.label, value: c.value })),
    }

    acc.push(item as unknown as SelectMixedOption)

    return acc
  }, [])
