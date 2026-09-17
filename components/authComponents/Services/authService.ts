// components/authComponents/Services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredUser } from '../types/auth.types';

// No backend yet — log in always succeeds and stores whatever was typed (or a guest fallback).
export async function login(username: string): Promise<StoredUser> {
  const user: StoredUser = { id: 'u123456', username: username.trim() || 'guest' };
  await AsyncStorage.setItem('userInfo', JSON.stringify(user));
  return user;
}
