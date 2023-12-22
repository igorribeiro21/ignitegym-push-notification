import { VStack, FlatList, HStack, Heading, Text, useToast } from 'native-base';
import { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { differenceInDays } from 'date-fns';

import { api } from '@services/api';
import { HomeHeader } from '@components/HomeHeader';
import { Group } from '@components/Group';
import { ExerciseCard } from '@components/ExerciseCard';

import { AppNavigatorRoutesProps } from '@routes/app.routes';
import { AppError } from '@utils/AppError';
import { ExerciseDTO } from '@dtos/ExerciseDTO';
import { Loading } from '@components/Loading';
import { HistoryDTO } from '@dtos/HistoryDTO';
import { tagDaysOff } from '../notifications/notificationTags';


export function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [groupSelected, setGroupSelected] = useState('antebraço');
    const [groups, setGroups] = useState<string[]>([]);
    const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
    const [exercisesHistory, setExercisesHistory] = useState<HistoryDTO[]>([]);

    const toast = useToast();
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    function handleOpenExerciseDetails(exerciseId: string) {
        navigation.navigate('exercise', { exerciseId });
    }

    async function fetchGroups() {
        try {

            const response = await api.get('/groups');

            setGroups(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os grupos musculares.';

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            });
        }
    }

    async function fetchExecisesByGroup() {
        try {
            setIsLoading(true);
            const response = await api.get(`/exercises/bygroup/${groupSelected}`);

            setExercises(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os exercícios.';

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchHistory() {
        try {
            setIsLoading(true);

            const response = await api.get('/history');

            setExercisesHistory(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar o histórico.';

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchGroups();
        fetchHistory();
    }, []);

    useEffect(() => {
        const ultimoDia = exercisesHistory[0] as any;
        const dataUltimoDia = ultimoDia?.data[0] as HistoryDTO;
        const ultimoDiaExercicio = dataUltimoDia?.created_at;

        const differenceDaysLastExercise = differenceInDays(new Date(), new Date(ultimoDiaExercicio));

        tagDaysOff(differenceDaysLastExercise);
    }, [exercisesHistory])

    useFocusEffect(useCallback(() => {
        fetchExecisesByGroup();
    }, [groupSelected]))

    return (
        <VStack flex={1}>
            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={groupSelected.toLocaleUpperCase() === item.toLocaleUpperCase()}
                        onPress={() => setGroupSelected(item)}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                _contentContainerStyle={{ px: 8 }}
                my={10}
                maxH={10}
                minH={10}
            />

            {
                isLoading ? <Loading /> :
                    <VStack flex={1} px={8}>
                        <HStack
                            justifyContent="space-between"
                            mb={5}
                        >
                            <Heading color="gray.200" fontSize="md" fontFamily='heading'>
                                Exercícios
                            </Heading>

                            <Text color="gray.200" fontSize="xl">
                                {exercises.length}
                            </Text>
                        </HStack>

                        <FlatList
                            data={exercises}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <ExerciseCard
                                    onPress={() => handleOpenExerciseDetails(item.id)}
                                    data={item}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            _contentContainerStyle={{
                                paddingBottom: 20
                            }}
                        />


                    </VStack>
            }
        </VStack>
    );
}