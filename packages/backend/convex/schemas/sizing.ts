import { zodToConvex } from 'zodvex'
import { z } from 'zod'
import { v } from 'convex/values'

// waist range 20-70, increments of 1, as object literal of strings
export const WAIST = [
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  '48',
  '50',
  '52',
  '54',
  '56',
  '58',
  '60',
  '62',
  '64',
  '66',
  '68',
  '70'
] as const
export const zWaist = z.enum(WAIST).optional()

// inseam range 26-36, increments of 1, as object literal of strings
export const INSEAM = [
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36'
] as const
export const zInseam = z.enum(INSEAM).optional()

// glove range 6-12, increments of 0.5, as object literal of strings
export const GLOVE = [
  '6',
  '6.5',
  '7',
  '7.5',
  '8',
  '8.5',
  '9',
  '9.5',
  '10',
  '10.5',
  '11',
  '11.5',
  '12'
] as const
export const zGlove = z.enum(GLOVE).optional()

// hat range 19-25, increments of 1, as object literal of strings
export const HAT = ['19', '20', '21', '22', '23', '24', '25'] as const
export const zHat = z.enum(HAT).optional()

// chest range 24-63, increments of 1, as object literal of strings
export const CHEST = [
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '60',
  '61',
  '62',
  '63'
] as const
export const zChest = z.enum(CHEST).optional()

// neck range 14-30, increments of 0.5, as object literal of strings
export const NECK = [
  '14',
  '14.5',
  '15',
  '15.5',
  '16',
  '16.5',
  '17',
  '17.5',
  '18',
  '18.5',
  '19',
  '19.5',
  '20',
  '20.5',
  '21',
  '21.5',
  '22',
  '22.5',
  '23',
  '23.5',
  '24',
  '24.5',
  '25',
  '25.5',
  '26',
  '26.5',
  '27',
  '27.5',
  '28',
  '28.5',
  '29',
  '29.5',
  '30'
] as const
export const zNeck = z.enum(NECK).optional()

// sleeve range 15-40, increments of 0.5, as object literal of strings
export const SLEEVE = [
  '15',
  '15.5',
  '16',
  '16.5',
  '17',
  '17.5',
  '18',
  '18.5',
  '19',
  '19.5',
  '20',
  '20.5',
  '21',
  '21.5',
  '22',
  '22.5',
  '23',
  '23.5',
  '24',
  '24.5',
  '25',
  '25.5',
  '26',
  '26.5',
  '27',
  '27.5',
  '28',
  '28.5',
  '29',
  '29.5',
  '30',
  '30.5',
  '31',
  '31.5',
  '32',
  '32.5',
  '33',
  '33.5',
  '34',
  '34.5',
  '35',
  '35.5',
  '36',
  '36.5',
  '37',
  '37.5',
  '38',
  '38.5',
  '39',
  '39.5',
  '40'
] as const
export const zSleeve = z.enum(SLEEVE).optional()

export const COATLENGTH = ['Short', 'Regular', 'Long', 'Extra-Long'] as const
export const zCoatLength = z.enum(COATLENGTH).optional()

// t-shirt sizing range XXS-5XL, as object literal
export const SHIRT = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL'
] as const
export const zShirt = z.enum(SHIRT).optional()

// men's shoe size range 6-17.5, increments of 0.5, as object literal of strings
export const SHOESMEN = [
  '6',
  '6.5',
  '7',
  '7.5',
  '8',
  '8.5',
  '9',
  '9.5',
  '10',
  '10.5',
  '11',
  '11.5',
  '12',
  '12.5',
  '13',
  '13.5',
  '14',
  '14.5',
  '15',
  '15.5',
  '16',
  '16.5',
  '17',
  '17.5'
] as const
export const zShoesMen = z.enum(SHOESMEN).optional()

// women's shoe size range 4-17, increments of 0.5, as object literal of strings
export const SHOESWOMEN = [
  '4',
  '4.5',
  '5',
  '5.5',
  '6',
  '6.5',
  '7',
  '7.5',
  '8',
  '8.5',
  '9',
  '9.5',
  '10',
  '10.5',
  '11',
  '11.5',
  '12',
  '12.5',
  '13',
  '13.5',
  '14',
  '14.5',
  '15',
  '15.5',
  '16',
  '16.5',
  '17'
] as const
export const zShoesWomen = z.enum(SHOESWOMEN).optional()

export const SHOEWIDTH = ['Narrow', 'Regular', 'Wide'] as const
export const zShoeWidth = z.enum(SHOEWIDTH).optional()

// dress sizing range 00-30, as object literal of strings
export const DRESSORPANT = [
  '00',
  '0',
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '22',
  '24',
  '26',
  '28',
  '30'
] as const
export const zDressOrPant = z.enum(DRESSORPANT).optional()

// cup sizing range AA-K, as object literal
export const CUP = [
  'AA',
  'A',
  'B',
  'C',
  'D',
  'DD/E',
  'DDD/F',
  'DDDD/G',
  'H',
  'I',
  'J',
  'K'
] as const
export const zCup = z.enum(CUP).optional()

// Bust range 19-66, increments of 1, as object literal of strings
export const BUST = [
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  '48',
  '50',
  '52',
  '54',
  '56',
  '58',
  '60',
  '62',
  '64',
  '66'
] as const
export const zBust = z.enum(BUST).optional()

// Under Bust range 19-66, increments of 1, as object literal of strings
export const UNDERBUST = [
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  '48',
  '50',
  '52',
  '54',
  '56',
  '58',
  '60',
  '62',
  '64',
  '66'
] as const
export const zUnderBust = z.enum(UNDERBUST).optional()

const zodEnum = z.enum(['foo', 'bar'])

// EXPECTED OUTPUT TYPE TO BE SAME AS BELOW
// VUnion<"foo" | "bar", [VLiteral<"foo", "required">, VLiteral<"bar", "required">], "required", never>
const convexEnum = v.union(v.literal('foo'), v.literal('bar'))

// ACTUAL OUTPUT TYPE CONVERTING FROM ZOD ENUM
// VUnion<"foo" | "bar", any[], "required", any>
const test = zodToConvex(zodEnum)

// Hip range 15-70, increments of 1, as object literal of strings
export const HIPS = [
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '38',
  '40',
  '42',
  '44',
  '46',
  '48',
  '50',
  '52',
  '54',
  '56',
  '58',
  '60',
  '62',
  '64',
  '66',
  '68',
  '70'
] as const
export const zHips = z.enum(HIPS).optional()

export const sizingPlainObject = {
  general: z
    .object({
      waist: zWaist,
      inseam: zInseam,
      glove: zGlove,
      hat: zHat
    })
    .partial()
    .optional(),

  male: z
    .object({
      neck: zNeck,
      chest: zChest,
      sleeve: zSleeve,
      coatLength: zCoatLength,
      shirt: zShirt,
      shoes: zShoesMen
    })
    .partial()
    .optional(),

  female: z
    .object({
      hips: zHips,
      bust: zBust,
      underbust: zUnderBust,
      cup: zCup,
      coatLength: zCoatLength,
      shirt: zShirt,
      dress: zDressOrPant,
      pants: zDressOrPant,
      shoes: zShoesWomen
    })
    .partial()
    .optional()
}
