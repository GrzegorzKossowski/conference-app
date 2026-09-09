import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function ConfirmRegistrationEmail({
  eventTitle,
  confirmUrl,
}: {
  eventTitle: string;
  confirmUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Potwierdź swój zapis na {eventTitle}</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
          }}
        >
          <Heading style={{ fontSize: "20px" }}>{eventTitle}</Heading>
          <Text>
            Dziękujemy za zapis! Aby potwierdzić rejestrację i otrzymać
            bilet z kodem QR, kliknij poniższy przycisk.
          </Text>
          <Button
            href={confirmUrl}
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              padding: "12px 20px",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            Potwierdź zapis
          </Button>
          <Text style={{ fontSize: "12px", color: "#6b7280" }}>
            Link jest ważny przez 48 godzin. Jeśli to nie Ty się zapisywałeś,
            zignoruj tę wiadomość.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ConfirmRegistrationEmail;
