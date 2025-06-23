import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';
import { useBetStore } from '../../store/betStore';
import { useAppStore } from '../../store/appStore';
import { CustomScrollView } from '../../components/CustomScrollView.tsx';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gameGrid: {
    gap: 12,
  },
  gameOption: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGame: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  gameIcon: {
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});

type GameType = 'rock-paper-scissors' | 'button-tap' | 'ladder-game';

export function BetAddScreen({ navigation }: any) {
  const colors = useTheme();
  const { addBet } = useBetStore();
  const { couple } = useAppStore();

  const users = couple?.users || [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stake, setStake] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameType>('rock-paper-scissors');

  const games = [
    {
      type: 'rock-paper-scissors' as GameType,
      title: '가위바위보',
      description: '클래식한 가위바위보 게임',
      icon: 'back-hand',
      color: colors.accent1,
    },
    {
      type: 'button-tap' as GameType,
      title: '버튼 누르기',
      description: '제한 시간 내 버튼을 많이 누르는 게임',
      icon: 'touch-app',
      color: colors.accent2,
    },
    {
      type: 'ladder-game' as GameType,
      title: '사다리 타기',
      description: '사다리를 타고 운을 시험하는 게임',
      icon: 'linear-scale',
      color: colors.secondary,
    },
  ];

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('알림', '내기 제목을 입력해주세요.');
      return;
    }

    if (!stake.trim()) {
      Alert.alert('알림', '내기 내용을 입력해주세요.');
      return;
    }

    if (users.length < 2) {
      Alert.alert('알림', '내기에는 최소 2명이 필요합니다.');
      return;
    }

    const newBet = {
      title: title.trim(),
      description: description.trim() || undefined,
      stake: stake.trim(),
      gameType: selectedGame,
      status: 'pending' as const,
      participants: users.map(user => user.id),
      createdBy: users[0].id, // 현재 사용자
    };

    addBet(newBet);

    Alert.alert(
      '내기 생성 완료! 🎮',
      '새로운 내기가 생성되었습니다.',
      [
        { text: '확인', onPress: () => navigation.goBack() }
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <CustomScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>🎮 내기 만들기</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          {/* 내기 제목 */}
          <View style={styles.section}>
            <Text style={styles.label}>내기 제목 *</Text>
            <TextInput
              style={styles.input}
              placeholder="무엇을 두고 내기할까요? 🎯"
              placeholderTextColor="#B0B0B0"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
            />
          </View>

          {/* 내기 설명 */}
          <View style={styles.section}>
            <Text style={styles.label}>내기 설명</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="내기에 대한 추가 설명을 적어주세요 📝"
              placeholderTextColor="#B0B0B0"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* 내기 내용 */}
          <View style={styles.section}>
            <Text style={styles.label}>내기 내용 *</Text>
            <TextInput
              style={styles.input}
              placeholder="진 사람이 무엇을 해야 할까요? 💸"
              placeholderTextColor="#B0B0B0"
              value={stake}
              onChangeText={setStake}
              maxLength={100}
            />
          </View>

          {/* 게임 선택 */}
          <View style={styles.section}>
            <Text style={styles.label}>게임 선택</Text>
            <View style={styles.gameGrid}>
              {games.map(game => (
                <TouchableOpacity
                  key={game.type}
                  style={[
                    styles.gameOption,
                    selectedGame === game.type && styles.selectedGame
                  ]}
                  onPress={() => setSelectedGame(game.type)}
                >
                  <View style={[
                    styles.gameIcon,
                    {
                      backgroundColor: game.color + '20',
                      borderRadius: 12,
                      padding: 8,
                    }
                  ]}>
                    <Icon name={game.icon} size={24} color={game.color} />
                  </View>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameDescription}>{game.description}</Text>
                  </View>
                  {selectedGame === game.type && (
                    <Icon name="check-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 생성 버튼 */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Icon name="add-circle" size={24} color="#fff" />
            <Text style={styles.createButtonText}>내기 만들기</Text>
          </TouchableOpacity>
        </View>
      </CustomScrollView>
    </SafeAreaView>
  );
}
