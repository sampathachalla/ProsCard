import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { RoleSelector } from '../../components/authComponents/Components/RoleSelector';
import { useSignup } from '../../components/authComponents/Hooks/useSignup';

export default function SignupScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    userType,
    setUserType,
    handleSignup,
  } = useSignup();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.light.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-6 py-12">
            {/* Heading */}
            <Text style={{ fontSize: 36, fontWeight: '800', color: Colors.light.tint, marginBottom: 4 }}>
              Create Account
            </Text>
            <Text style={{ fontSize: 14, color: Colors.light.mutedText, marginBottom: 24 }}>
              Join the ProsCard community today
            </Text>

            {/* Signup Form */}
            <View style={{ width: '100%', padding: 24, borderRadius: 20 }}>
              {/* User Type Selection */}
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 12, color: Colors.light.text }}>
                I am a
              </Text>
              <RoleSelector value={userType} onChange={setUserType} />

              {/* Email */}
              <TextInput
                placeholder="Email"
                style={{
                  borderBottomWidth: 1,
                  borderColor: Colors.light.border,
                  marginBottom: 20,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: Colors.light.text,
                }}
                placeholderTextColor={Colors.light.mutedText}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              {/* Password */}
              <TextInput
                placeholder="Password"
                style={{
                  borderBottomWidth: 1,
                  borderColor: Colors.light.border,
                  marginBottom: 20,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: Colors.light.text,
                }}
                placeholderTextColor={Colors.light.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {/* Confirm Password */}
              <TextInput
                placeholder="Confirm Password"
                style={{
                  borderBottomWidth: 1,
                  borderColor: Colors.light.border,
                  marginBottom: 28,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: Colors.light.text,
                }}
                placeholderTextColor={Colors.light.mutedText}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.light.tint,
                  padding: 14,
                  borderRadius: 14,
                }}
                onPress={handleSignup}
              >
                <Text
                  style={{
                    color: Colors.palette.primaryWhite,
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={{ fontSize: 14, color: Colors.light.text, marginTop: 24 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: Colors.light.tint, fontWeight: '600' }}>
                Log in
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
