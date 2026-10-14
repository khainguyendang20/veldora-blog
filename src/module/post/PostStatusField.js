import { Radio } from "components/checkbox";
import { Field, FieldCheckboxes } from "components/field";
import { Label } from "components/label";
import React from "react";
import { postStatus } from "utils/constants";

const staffOptions = [
  [postStatus.APPROVED, "Approved"],
  [postStatus.PENDING, "Pending"],
  [postStatus.REJECTED, "Rejected"],
  [postStatus.DRAFT, "Draft"],
  [postStatus.SCHEDULED, "Scheduled"],
];

// Authors keep drafts and send them for review; Firestore rules let them
// move a post only between these two (or resubmit a rejected one)
const authorOptions = [
  [postStatus.DRAFT, "Draft"],
  [postStatus.PENDING, "Submit for review"],
];

const PostStatusField = ({
  control,
  status,
  savedStatus,
  canModerate,
  publishAt,
  onPublishAtChange,
}) => {
  // A published or scheduled post is out of its author's hands
  if (!canModerate && [postStatus.APPROVED, postStatus.SCHEDULED].includes(savedStatus)) {
    return (
      <Field>
        <Label>Status</Label>
        <p>
          {savedStatus === postStatus.APPROVED ? "Published" : "Scheduled"}
        </p>
      </Field>
    );
  }
  const options = canModerate ? staffOptions : authorOptions;
  return (
    <Field>
      <Label>Status</Label>
      {!canModerate && savedStatus === postStatus.REJECTED && (
        <p>This post was rejected. Edit it and submit it for review again.</p>
      )}
      <FieldCheckboxes>
        {options.map(([value, label]) => (
          <Radio
            key={value}
            name="status"
            control={control}
            checked={status === value}
            value={value}
          >
            {label}
          </Radio>
        ))}
      </FieldCheckboxes>
      {canModerate && status === postStatus.SCHEDULED && (
        <>
          <Label htmlFor="publishAt">Publish at</Label>
          <input
            id="publishAt"
            type="datetime-local"
            value={publishAt}
            onChange={(e) => onPublishAtChange(e.target.value)}
          />
          <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
            Published by the next daily run after this time.
          </p>
        </>
      )}
    </Field>
  );
};

export default PostStatusField;
