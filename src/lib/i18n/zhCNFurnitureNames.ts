const words: Record<string, string> = {
  sofa: '沙发', loveseat: '双人沙发', armchair: '扶手椅', coffee: '茶几', table: '桌',
  tv: '电视', stand: '柜', bookshelf: '书架', side: '边几', queen: '双人', twin: '单人',
  bed: '床', nightstand: '床头柜', dresser: '斗柜', wardrobe: '衣柜', stove: '炉灶',
  fridge: '冰箱', sink: '水槽', counter: '操作台', dishwasher: '洗碗机', oven: '烤箱',
  toilet: '马桶', bathtub: '浴缸', shower: '淋浴间', washer: '洗衣机', dryer: '烘干机',
  desk: '书桌', office: '办公', chair: '椅', dining: '餐厅', fireplace: '壁炉', television: '电视机',
  storage: '储物柜', cabinet: '柜', rug: '地毯', round: '圆形', runner: '长条', potted: '盆栽',
  plant: '植物', floor: '落地', hanging: '悬挂式', curtain: '窗帘', sheer: '薄纱', wall: '墙面',
  art: '装饰画', mirror: '镜子', clock: '时钟', ceiling: '吸顶灯', light: '灯', chandelier: '吊灯',
  recessed: '嵌入式', lamp: '灯', sconce: '壁灯', pendant: '吊灯', patio: '庭院', park: '公园',
  bench: '长椅', sun: '日光浴', lounger: '躺椅', umbrella: '遮阳伞', bbq: '烧烤架', fire: '火',
  pit: '火盆', campfire: '篝火', picnic: '野餐', tent: '帐篷', sign: '标牌', large: '大型',
  small: '小型', pot: '花盆', oak: '橡树', tree: '树', deciduous: '落叶', detailed: '精细',
  pine: '松树', tall: '高大', palm: '棕榈树', bent: '弯曲', fat: '粗壮', simple: '简易',
  thin: '细长', cone: '圆锥形', blocky: '块状', bush: '灌木', triangle: '三角形', hedge: '绿篱',
  row: '排', cactus: '仙人掌', short: '矮', moss: '苔藓', purple: '紫色', red: '红色', yellow: '黄色',
  flower: '花', b: 'B 型', flowers: '花卉', water: '水生', lily: '睡莲', grass: '草', tuft: '草簇',
  leaves: '草叶', leaf: '草叶', rock: '岩石', stone: '石材', boulder: '巨石', mushroom: '蘑菇',
  group: '组合', tan: '浅褐色', log: '原木', stump: '树桩', old: '旧', corn: '玉米', stalks: '秆',
  pumpkin: '南瓜', column: '柱', statue: '雕像', obelisk: '方尖碑', fence: '围栏', plank: '木板',
  gate: '大门', corner: '转角', picket: '栅栏', metal: '金属', pergola: '廊架', deck: '平台',
  raised: '高架', garden: '花园', shed: '棚屋', gazebo: '凉亭', planter: '种植箱', box: '箱',
  pool: '泳池', rectangular: '矩形', shaped: '形', l: 'L', kidney: '肾形', hot: '热水', tub: '浴池',
  ladder: '梯', diving: '跳水', board: '板', car: '汽车', sedan: '轿车', suv: 'SUV', garage: '车库',
  door: '门', single: '单', double: '双', workbench: '工作台', tool: '工具', bike: '自行车',
  bicycle: '自行车', motorcycle: '摩托车', lawn: '草坪', rectangle: '矩形', square: '方形',
  path: '小径', straight: '直线', wide: '宽', gravel: '砾石', area: '区域', stepping: '踏步',
  stones: '石', driveway: '车道', sandbox: '沙坑', post: '灯柱', bollard: '矮柱灯', spot: '射灯',
  string: '串灯', solar: '太阳能', flood: '泛光', greenhouse: '温室', trellis: '格架', arbor: '花架',
  compost: '堆肥', bin: '箱', rain: '雨水', barrel: '桶', bird: '鸟类', bath: '浴盆', fountain: '喷泉',
  mailbox: '邮箱', power: '电源', outlet: '插座', switch: '开关', fan: '风扇', junction: '接线',
  smoke: '烟雾', detector: '探测器', supply: '供水', drain: '排水口', heater: '热水器', hookup: '接口',
  gas: '燃气', line: '管线', imported: '导入的', unrecognized: '未识别', item: '物件', stairs: '楼梯',
  glass: '玻璃', color: '色', stonepatio: '石铺庭院',
};

const overrides: Record<string, string> = {
  sink_k: '厨房水槽', sink_b: '洗手池', washer_dryer: '洗衣烘干机', imported_object: '未识别物件',
  stairs: '导入的楼梯', tv_stand: '电视柜', bed_queen: '双人床', bed_twin: '单人床',
  fire_pit: '户外火盆', bbq_grill: '烧烤架', tree_default: '落叶树', flower_bed: '花坛',
  pool_lshaped: 'L 形泳池', pool_kidney: '肾形泳池', garage_door_single: '单车库门',
  garage_door_double: '双车库门', patio_stone: '石铺庭院', lawn_rect: '矩形草坪', lawn_square: '方形草坪',
  sym_outlet: '电源插座', sym_switch: '电灯开关', sym_ceiling_fan: '吊扇', sym_junction: '接线盒',
  sym_smoke: '烟雾探测器', sym_water_supply: '供水点', sym_drain: '排水点', sym_water_heater: '热水器',
  sym_washer_hookup: '洗衣机接口', sym_gas_line: '燃气管线',
};

export function zhCNFurnitureName(id: string, name: string): string {
  if (overrides[id]) return overrides[id];
  return name.split(/([\s/()-]+)/).map((part) => {
    if (/^[\s/()-]+$/.test(part)) return part;
    return words[part.toLowerCase()] ?? part;
  }).join('');
}