import { WebClient, LogLevel } from "@slack/web-api";
import { groupBy, sort } from "ramda";

const web = new WebClient(process.env.SLACK_TOKEN, {
  logLevel: LogLevel.DEBUG
  // agent: proxy,
});

export default async function getSlackUsers(req, res) {
  const response = await web.users.list();
  const users = response.members
    .filter((m) => m.deleted === false)
    .filter((m) => m.is_bot === false)
    .filter((m) => m.is_app_user === false)
    .map((m) => ({
      id: m.id,
      name: m.real_name,
      timezone: m.tz,
      timezoneOffset: m.tz_offset,
      description: m.profile.title,
      status: m.profile.status_text,
      statusEmoj: m.profile.status_emoji,
      avatars: {
        small: m.profile.image_24,
        medium: m.profile.image_192,
        large: m.profile.image_1024
      }
    }));

  const groupByed = groupBy((u) => u.timezoneOffset, users);
  const usersByTz = sort(
    (a, b) => Number(a.tz) - Number(b.tz),
    Object.keys(groupByed).map((tz) => ({
      tz,
      tzName: groupByed[tz][0].timezone,
      users: groupByed[tz]
    }))
  );

  res.status(200).json(usersByTz);
}
