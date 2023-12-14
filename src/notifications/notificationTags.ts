import { OneSignal } from 'react-native-onesignal';

export function tagDaysOff(days: number) {
    OneSignal.User.addTag('days_off', String(days));
}