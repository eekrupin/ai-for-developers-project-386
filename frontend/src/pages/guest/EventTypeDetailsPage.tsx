import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../../api/client'
import type { AvailableSlot, EventType } from '../../api/types'
import { AsyncState } from '../../components/ui/AsyncState'
import { formatDateTimeRange, toIsoDateTime } from '../../lib/date'

export function EventTypeDetailsPage() {
  const { eventTypeId = '' } = useParams()
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromValue, setFromValue] = useState('')
  const [toValue, setToValue] = useState('')

  function loadData(from?: string, to?: string) {
    setLoading(true)
    setError(null)

    Promise.all([api.getEventType(eventTypeId), api.listAvailableSlots(eventTypeId, from, to)])
      .then(([eventTypeResponse, slotsResponse]) => {
        setEventType(eventTypeResponse)
        setSlots(slotsResponse)
      })
      .catch((caughtError: Error) => {
        if (caughtError instanceof ApiError && caughtError.status === 404) {
          setError('Тип события не найден.')
          return
        }

        setError(caughtError.message)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [eventTypeId])

  const selectedFrom = toIsoDateTime(fromValue)
  const selectedTo = toIsoDateTime(toValue)

  return (
    <Stack gap="lg">
      <Button component={Link} to="/" variant="subtle" px={0}>
        Назад к списку
      </Button>

      {eventType ? (
        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={2}>{eventType.name}</Title>
              <Text c="dimmed">{eventType.description}</Text>
            </div>
            <Badge variant="light">{eventType.durationMinutes} мин</Badge>
          </Group>
        </Card>
      ) : null}

      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Title order={4}>Фильтр слотов</Title>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            <TextInput
              type="datetime-local"
              label="От"
              value={fromValue}
              onChange={(event) => setFromValue(event.currentTarget.value)}
            />
            <TextInput
              type="datetime-local"
              label="До"
              value={toValue}
              onChange={(event) => setToValue(event.currentTarget.value)}
            />
          </SimpleGrid>

          <Group>
            <Button onClick={() => loadData(selectedFrom, selectedTo)}>Обновить слоты</Button>
            <Button
              variant="default"
              onClick={() => {
                setFromValue('')
                setToValue('')
                loadData()
              }}
            >
              Сбросить
            </Button>
          </Group>
        </Stack>
      </Card>

      {error && !loading ? (
        <Alert color="yellow" title="Подсказка по контракту">
          Контракт разрешает запрашивать слоты только в пределах ближайших 14 дней. Если передаёте `from/to`, диапазон должен быть валидным и положительным.
        </Alert>
      ) : null}

      <AsyncState
        loading={loading}
        error={error}
        empty={!slots.length}
        emptyTitle="Свободных слотов нет"
        emptyDescription="Попробуйте другой диапазон или вернитесь позже."
      >
        <Stack gap="md">
          {slots.map((slot) => {
            const bookingUrl = `/bookings/new?eventTypeId=${slot.eventTypeId}&startAt=${encodeURIComponent(slot.startAt)}&endAt=${encodeURIComponent(slot.endAt)}`

            return (
              <Card key={`${slot.startAt}-${slot.endAt}`} withBorder radius="md">
                <Group justify="space-between" wrap="wrap">
                  <div>
                    <Text fw={600}>{formatDateTimeRange(slot.startAt, slot.endAt)}</Text>
                    <Text size="sm" c="dimmed">
                      Слот рассчитан на выбранный тип события.
                    </Text>
                  </div>
                  <Button component={Link} to={bookingUrl}>
                    Забронировать
                  </Button>
                </Group>
              </Card>
            )
          })}
        </Stack>
      </AsyncState>
    </Stack>
  )
}
