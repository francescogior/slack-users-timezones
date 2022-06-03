import { useEffect, useState } from "react";
import styled from "@emotion/styled";
const { utcToZonedTime, format } = require("date-fns-tz");

const DATE_PATTERN = "EEE hh:mm aa";

function useFetchUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function fetchUsers() {
      const usersResponse = await (await fetch("/api/users")).json();
      setUsers(usersResponse);
    }
    fetchUsers();
  }, []);
  return users;
}

const Root = styled.div({
  fontFamily: "sans-serif",
});

const Stack = styled.div(({ dir = "row", width, height, justify }) => ({
  display: "flex",
  flexDirection: dir,
  width,
  height,
  justifyContent: justify,
}));

const Spacer = styled.div(({ width, height, grow }) => ({
  width,
  height,
  flexShrink: 0,
  flexGrow: grow ? 1 : "auto",
}));

const LocalDateTime = styled.h2({
  fontSize: 14,
  textAlign: "center",
  color: "#112233",
});

const USER_CARD_SIZE = 96;
const UserCard = styled.div(({ bg }) => ({
  width: USER_CARD_SIZE,
  height: USER_CARD_SIZE,
  padding: 4,
  boxSizing: "border-box",
  margin: 8,
  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, .8), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url(${bg})`,
  borderRadius: 4,
  boxShadow: "0 1px 10px rgba(33, 55 , 77, .5)",
  backgroundSize: "auto, cover",
  backgroundRepeat: "no-repeat, no-repeat",
  backgroundPosition: "bottom center, center center",
}));

const UserName = styled.h2({
  color: "white",
  fontSize: 14,
  margin: 0,
  textShadow: "0 0 1px black",
});

const Status = styled.p({
  color: "white",
  fontSize: 12,
  margin: 0,
  textShadow: "0 0 1px black",
});

function useUtcTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return time;
}

function DisplayLocalDateTime({ tzName }) {
  const utcTime = useUtcTime();
  return (
    <LocalDateTime>
      {format(utcToZonedTime(utcTime, tzName), DATE_PATTERN, tzName)}
    </LocalDateTime>
  );
}

export default function IndexPage() {
  const usersByTimezone = useFetchUsers();
  return (
    <Root>
      <Stack justify="center">
        {usersByTimezone.map((tzGroup) => (
          <Stack dir="column" key={tzGroup.tz}>
            <DisplayLocalDateTime tzName={tzGroup.tzName} />

            {tzGroup.users.map((user) => (
              <UserCard
                key={user.id}
                bg={user.avatars.medium}
                title={user.description}
              >
                <Stack dir="column" height="100%">
                  <Spacer grow />
                  <UserName>{user.name}</UserName>
                  <Status>{user.status}</Status>
                </Stack>
              </UserCard>
            ))}
          </Stack>
        ))}
      </Stack>
    </Root>
  );
}
