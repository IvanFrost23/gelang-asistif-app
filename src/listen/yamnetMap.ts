import type { Category } from '../domain/signals'

/** Классы YAMNet (display_name из yamnet_class_map.csv), которые относим к нашим категориям. */
export const CLASS_TO_CATEGORY: Record<string, Category> = {
  // Опасность
  'Siren': 'danger', 'Civil defense siren': 'danger', 'Police car (siren)': 'danger', 'Ambulance (siren)': 'danger',
  'Fire engine, fire truck (siren)': 'danger', 'Fire alarm': 'danger', 'Smoke detector, smoke alarm': 'danger',
  'Vehicle horn, car horn, honking': 'danger', 'Car alarm': 'danger', 'Air horn, truck horn': 'danger', 'Emergency vehicle': 'danger',
  'Alarm': 'danger', 'Buzzer': 'danger', 'Train horn': 'danger', 'Foghorn': 'danger',
  // Школьный звонок, сигнал времени
  'Bell': 'bell', 'Church bell': 'bell', 'Chime': 'bell', 'Alarm clock': 'bell', 'Bicycle bell': 'bell', 'Ringtone': 'bell',
  'Telephone bell ringing': 'bell', 'Telephone': 'bell', 'Wind chime': 'bell', 'Jingle bell': 'bell', 'Tubular bells': 'bell', 'Whistle': 'bell',
  // Домашние звуки
  'Doorbell': 'home', 'Ding-dong': 'home', 'Ding': 'home', 'Knock': 'home', 'Door': 'home', 'Tap': 'home', 'Sliding door': 'home',
}
