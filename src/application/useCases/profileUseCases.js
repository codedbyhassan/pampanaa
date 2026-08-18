import { appService } from '../services/appService';

export const profileUseCases = Object.freeze({
  list: () => appService.profiles.list(),
  getActiveName: () => appService.profiles.getActiveName(),
  signIn: (name) => appService.profiles.signIn(name),
  signOut: () => appService.profiles.signOut(),
  rename: (name, newName) => appService.profiles.rename(name, newName),
  touch: (name) => appService.profiles.touch(name),
  remove: (name) => appService.profiles.remove(name),
});
