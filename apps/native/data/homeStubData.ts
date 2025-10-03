import type { ChoreographerItem } from '~/components/home/TeachingThisWeekSection';
import type { SessionItem } from '~/components/home/InSessionSection';
import type { ScheduleItem } from '~/components/home/ScheduleModal';

// Placeholder images - using existing home images
const mediaCover = require('~/assets/images/home/media-cover.png');
const databaseCover = require('~/assets/images/home/database-cover.png');
const advertCover = require('~/assets/stub/Advertisement.png');

// Hero carousel data
export const heroCarouselItems = [
  {
    id: '1',
    imageUrl: advertCover,
  },
  {
    id: '2',
    imageUrl: advertCover,
  },
  {
    id: '3',
    imageUrl: advertCover,
  },
];

// Teaching This Week - Choreographers
export const choreographers: ChoreographerItem[] = [
  {
    id: '1',
    name: 'JaQuel Knight',
    imageUrl: mediaCover,
    date: {
      day: '19',
      month: 'AUG',
    },
  },
  {
    id: '2',
    name: 'Nycole Altchiler',
    imageUrl: databaseCover,
    date: {
      day: '19',
      month: 'AUG',
    },
  },
  {
    id: '3',
    name: 'Christopher Scott',
    imageUrl: mediaCover,
    date: {
      day: '20',
      month: 'SEP',
    },
  },
];

// In Session - Sessions
export const sessions: SessionItem[] = [
  {
    id: '1',
    name: 'Mikey Dellavella',
    imageUrl: mediaCover,
    date: {
      day: '19',
      month: 'AUG',
    },
  },
  {
    id: '2',
    name: 'Tyrik Patterson',
    imageUrl: databaseCover,
    date: {
      day: '19',
      month: 'AUG',
    },
  },
  {
    id: '3',
    name: 'Devin Soloman',
    imageUrl: mediaCover,
    date: {
      day: '19',
      month: 'AUG',
    },
  },
];

// Schedule modal - Classes data
export const classesScheduleItems: ScheduleItem[] = [
  {
    id: '1',
    name: 'Maya Taylor',
    imageUrl: mediaCover,
    type: 'Technique',
    typeColor: 'accent',
    location: 'Movement Lifestyle',
    time: '6:00 PM',
    date: '2024-08-19',
  },
  {
    id: '2',
    name: 'Christopher Scott',
    imageUrl: databaseCover,
    type: 'Master Class',
    typeColor: 'green',
    location: 'Mihran K Studios',
    time: '5:00 PM',
    date: '2024-08-19',
  },
  {
    id: '3',
    name: 'JaQuel Knight',
    imageUrl: mediaCover,
    type: 'Intensive',
    typeColor: 'green',
    location: 'Mihran K Studios',
    time: '3:00 PM',
    date: '2024-08-19',
  },
];

// Schedule modal - Sessions data
export const sessionsScheduleItems: ScheduleItem[] = [
  {
    id: '1',
    name: 'Mikey Dellavella',
    imageUrl: mediaCover,
    type: 'Creative Session',
    typeColor: 'orange',
    location: 'Studio A',
    time: '2:00 PM',
    date: '2024-08-19',
  },
  {
    id: '2',
    name: 'Tyrik Patterson',
    imageUrl: databaseCover,
    type: 'Movement Lab',
    typeColor: 'accent',
    location: 'Studio B',
    time: '4:00 PM',
    date: '2024-08-19',
  },
];

// Day options for schedule modal
export const scheduleModalDays = [
  { label: 'TUE', value: '2024-08-19', dayNumber: '19' },
  { label: 'WED', value: '2024-08-20', dayNumber: '20' },
  { label: 'THU', value: '2024-08-21', dayNumber: '21' },
  { label: 'FRI', value: '2024-08-22', dayNumber: '22' },
  { label: 'SAT', value: '2024-08-23', dayNumber: '23' },
  { label: 'SUN', value: '2024-08-24', dayNumber: '24' },
  { label: 'MON', value: '2024-08-25', dayNumber: '25' },
];
