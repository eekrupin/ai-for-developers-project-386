import { Badge, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { formatDayOfMonth, formatSlotsCount, formatWeekdayShort, isTodayDateKey } from '../../lib/date'

type SlotsCalendarProps = {
  dateKeys: string[]
  selectedDateKey: string | null
  slotsCountByDate: Record<string, number>
  onSelect: (dateKey: string) => void
}

export function SlotsCalendar({
  dateKeys,
  selectedDateKey,
  slotsCountByDate,
  onSelect,
}: SlotsCalendarProps) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={700}>Выберите день</Text>
            <Text size="sm" c="dimmed">
              Показываем ближайшие 14 дней, доступные для записи.
            </Text>
          </div>
          <Badge variant="light">14 дней</Badge>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4, md: 2, lg: 4 }}>
          {dateKeys.map((dateKey) => {
            const slotsCount = slotsCountByDate[dateKey] || 0
            const isSelected = selectedDateKey === dateKey
            const isToday = isTodayDateKey(dateKey)

            return (
              <Button
                key={dateKey}
                aria-pressed={isSelected}
                aria-label={`${formatWeekdayShort(dateKey)} ${formatDayOfMonth(dateKey)}. ${slotsCount > 0 ? formatSlotsCount(slotsCount) : 'Слотов нет'}`}
                variant={isSelected ? 'filled' : slotsCount > 0 ? 'light' : 'default'}
                color={isSelected ? 'indigo' : 'gray'}
                onClick={() => onSelect(dateKey)}
                disabled={slotsCount === 0}
                h="auto"
                px="md"
                py="sm"
                styles={{ inner: { display: 'block', width: '100%' }, label: { width: '100%' } }}
              >
                <Stack gap={2} align="flex-start">
                  <Group gap={6} wrap="nowrap">
                    <Text tt="uppercase" size="xs" c={isSelected ? 'white' : 'dimmed'}>
                      {formatWeekdayShort(dateKey)}
                    </Text>
                    {isToday ? (
                      <Text size="xs" c={isSelected ? 'white' : 'indigo'}>
                        Сегодня
                      </Text>
                    ) : null}
                  </Group>
                  <Text fw={700} size="lg" c={isSelected ? 'white' : undefined}>
                    {formatDayOfMonth(dateKey)}
                  </Text>
                  <Text size="xs" c={isSelected ? 'white' : 'dimmed'}>
                    {slotsCount > 0 ? formatSlotsCount(slotsCount) : 'Нет слотов'}
                  </Text>
                </Stack>
              </Button>
            )
          })}
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
