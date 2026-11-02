import {useRef, useState, type ChangeEvent} from 'react'
import {Button, Flex, Stack, Text} from '@sanity/ui'
import {
  type ArrayOfObjectsInputProps,
  type InputProps,
  isArrayOfObjectsInputProps,
  useClient,
} from 'sanity'
import {apiVersion} from '../env'

type PhotoItem = {
  _key: string
  _type: 'image'
  asset: {_type: 'reference'; _ref: string}
  alt?: string
}

export function MultipleImageUploadInput(props: InputProps) {
  if (!isArrayOfObjectsInputProps(props)) return props.renderDefault(props)
  const arrayProps = props as ArrayOfObjectsInputProps

  const client = useClient({apiVersion})
  const fileInput = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (files.length === 0) return

    setUploading(true)
    setStatus(`Uploading ${files.length} photo${files.length === 1 ? '' : 's'}...`)

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const asset = await client.assets.upload('image', file, {
          filename: file.name,
          contentType: file.type || undefined,
        })

        return {
          _key: crypto.randomUUID(),
          _type: 'image' as const,
          asset: {_type: 'reference' as const, _ref: asset._id},
          alt: file.name.replace(/\.[^.]+$/, ''),
        }
      }),
    )

    let uploadedCount = 0
    for (const result of results) {
      if (result.status === 'fulfilled') {
        arrayProps.onItemAppend(result.value)
        uploadedCount += 1
      }
    }

    const failedCount = files.length - uploadedCount
    setStatus(
      failedCount === 0
        ? `Added ${uploadedCount} photo${uploadedCount === 1 ? '' : 's'}.`
        : `Added ${uploadedCount}; ${failedCount} upload${failedCount === 1 ? '' : 's'} failed. You can retry the failed files.`,
    )
    setUploading(false)
  }

  return (
    <Stack space={3}>
      <Flex align="center" gap={3}>
        <Button
          type="button"
          mode="ghost"
          text={uploading ? 'Uploading photos...' : 'Choose multiple photos'}
          disabled={uploading || props.readOnly}
          onClick={() => fileInput.current?.click()}
        />
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFilesSelected}
        />
        {status && <Text size={1} muted>{status}</Text>}
      </Flex>
      {props.renderDefault(props)}
    </Stack>
  )
}