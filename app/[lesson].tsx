import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View, Text, StyleSheet, Platform } from 'react-native';
import lessonsData from '@/i18n/locales/en-us/lessons.json';
import basicsSections from '@/i18n/locales/en-us/sections/basics.json';
import foodSections from '@/i18n/locales/en-us/sections/food.json';
import personalInfoSections from '@/i18n/locales/en-us/sections/personal information.json';
import possessiveAdjSections from '@/i18n/locales/en-us/sections/possessive adjectives.json';
import subjectPronounsSections from '@/i18n/locales/en-us/sections/subject pronouns.json';
import toBeSections from '@/i18n/locales/en-us/sections/to be.json';
import weatherSections from '@/i18n/locales/en-us/sections/weather.json';
import yesOrNoQuestionsSections from '@/i18n/locales/en-us/sections/yes or no questions.json';
import whQuestionsSections from '@/i18n/locales/en-us/sections/wh questions.json';
import prepositionsOfPlaceSections from '@/i18n/locales/en-us/sections/prepositions of place.json';
import articlesSections from '@/i18n/locales/en-us/sections/articles.json';
import adverbsOfFrequencySections from '@/i18n/locales/en-us/sections/adverbs of frequency.json';
import illnessesSections from '@/i18n/locales/en-us/sections/illnesses.json';
import pluralNounsSections from '@/i18n/locales/en-us/sections/plural nouns.json';
import partsOfSpeech1Sections from '@/i18n/locales/en-us/sections/parts of speech 1.json';
import prepositionsOfTimeSections from '@/i18n/locales/en-us/sections/prepositions of time.json';
import presentSimpleSections from '@/i18n/locales/en-us/sections/present simple.json';

const sectionsData = [
  ...yesOrNoQuestionsSections,
  ...weatherSections,
  ...basicsSections,
  ...foodSections,
  ...personalInfoSections,
  ...possessiveAdjSections,
  ...subjectPronounsSections,
  ...toBeSections,
  ...whQuestionsSections,
  ...prepositionsOfPlaceSections,
  ...articlesSections,
  ...adverbsOfFrequencySections,
  ...illnessesSections,
  ...pluralNounsSections,
  ...partsOfSpeech1Sections,
  ...prepositionsOfTimeSections,
  ...presentSimpleSections,
];
import vocabularyData from '@/i18n/locales/en-us/vocabulary.json';
import VocabCard from '@/components/VocabCard';
import Subheader from '@/components/sections/Subheader';
import SectionRenderer from '@/components/SectionRenderer';
import Notes from '@/components/Notes';
import { useDeck } from '@/contexts/DeckContext';

import { CENTERED_MAX_WIDTH } from '@/constants/constants';

export function generateStaticParams() {
  return lessonsData.map((entry: any) => {
    const name = Object.keys(entry)[0];
    return { lesson: name };
  });
}

export default function LessonPage() {
  const { lesson } = useLocalSearchParams();
  const lessonName = lesson as string;
  const { setDeckEntries, setDeckIndex } = useDeck();

  // Find the lesson entry
  const lessonEntry = lessonsData.find((entry: any) => entry[lessonName]);
  const lessonData = lessonEntry
    ? (lessonEntry as Record<string, any>)[lessonName]
    : null;

  if (!lessonData) {
    return <Text>Lesson not found</Text>;
  }

  // Use lessonData.name if available, otherwise fallback to lessonName
  const displayName = lessonData.name || lessonName;

  if (lessonData.__type === 'vocabulary') {
    // If __vocab is present, use it to group vocab entries by heading, but exclude 'display'
    const vocabGroups =
      lessonData.__vocab && typeof lessonData.__vocab === 'object'
        ? Object.fromEntries(
            Object.entries(lessonData.__vocab).filter(
              ([groupName]) => groupName !== 'display'
            )
          )
        : null;
    // Build a lookup for all vocab entries by key
    const vocabLookup = Array.isArray(vocabularyData)
      ? Object.fromEntries(
          vocabularyData.map((entry: any) => {
            const key = Object.keys(entry)[0];
            return [key, entry[key]];
          })
        )
      : {};

    // For deck navigation, flatten all vocab keys in order
    const allVocabKeys: string[] = vocabGroups
      ? Object.values(vocabGroups)
          .flatMap((arr) => (Array.isArray(arr) ? arr : []))
          .map(String)
      : [];

    React.useEffect(() => {
      setDeckEntries(allVocabKeys);
      setDeckIndex(null);
      return () => {
        setDeckEntries(null);
        setDeckIndex(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonName]);

    return (
      <ScrollView>
        <View style={[styles.outerContainerVocab, { marginTop: 10 }]}>
          <Notes noteKey={`lesson_${lessonName}`} />
          {/* <Text style={{ fontSize: 28, fontWeight: 'bold', margin: 16 }}>
            {displayName}
          </Text> */}
          {lessonData.intro && (
            <Text style={{ margin: 16, fontSize: 16 }}>{lessonData.intro}</Text>
          )}
          {vocabGroups
            ? Object.entries(vocabGroups).map(([groupName, vocabKeys]) => (
                <View
                  key={groupName}
                  style={{ marginBottom: 18, width: '100%' }}
                >
                  <Subheader text={groupName} />
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      rowGap: 3,
                      columnGap: 3,
                      justifyContent:
                        Platform.OS !== 'web' ? 'space-between' : undefined,
                    }}
                  >
                    {Array.isArray(vocabKeys) &&
                      vocabKeys.map((vocabKey: string) => {
                        const card = vocabLookup[vocabKey];
                        if (!card) return null;
                        // Find the global index for correct deck navigation
                        const globalIdx = allVocabKeys.indexOf(vocabKey);
                        return (
                          <VocabCard
                            key={vocabKey}
                            card={card}
                            vocabKey={vocabKey}
                            cardIndex={globalIdx}
                            size="medium"
                          />
                        );
                      })}
                  </View>
                </View>
              ))
            : null}
        </View>
      </ScrollView>
    );
  }

  if (lessonData.__type === 'lesson') {
    const sections = Array.isArray(sectionsData)
      ? sectionsData
          .filter((section: any) => section.__lessons?.includes(lessonName))
          .sort((a: any, b: any) => (a.__order ?? 0) - (b.__order ?? 0))
      : [];

    return (
      <ScrollView>
        <View style={styles.outerContainer}>
          <Notes noteKey={`lesson_${lessonName}`} />
          {/* <Text style={{ fontSize: 28, fontWeight: 'bold', margin: 16 }}>
            {displayName}
          </Text> */}
          {lessonData.intro && (
            <Text style={{ margin: 16, fontSize: 16 }}>{lessonData.intro}</Text>
          )}
          <View style={{ padding: 16 }}>
            {sections.map((section: any) => (
              <SectionRenderer
                key={section._id || section.__order}
                section={section}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  return <Text>Unknown lesson type</Text>;
}

export const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    maxWidth: CENTERED_MAX_WIDTH,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  outerContainerVocab: {
    width: '100%',
    maxWidth: CENTERED_MAX_WIDTH,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
});
