# Security radar: concept oktober 2026

Onderzocht op 22 oktober 2026. Dit is een voorstel voor de eerste Security-editie,
geen verklaring dat FreshMinds alle genoemde technologieën in productie gebruikt.
De unit owners bepalen de uiteindelijke posities volgens de bestaande
[besluitvorming](tech-radar-design-decisions.md). De overige radars veranderen niet.

## Onderbouwing van de ringen

De 21 entries zijn verdeeld over de vier bestaande kwadranten: 2 Adopt, 3 Trial,
14 Assess en 2 Hold. Alle entries zijn nieuw in deze unit en hebben `moved: 2`.

- **Adopt is overgenomen als voorstel uit bestaand beleid:** Passkeys staat al in
  de Global- en Software Engineering-radars; SonarQube in Software Engineering.
  Dit onderbouwt consistentie met bestaande aanbevelingen, niet nieuw bewijs van
  Security-productiegebruik. Bevestig de toepasbaarheid bij de Security owners.
- **Trial is overgenomen als voorstel uit het Cloud-concept:** Trivy, Checkov en
  HashiCorp Vault. De huidige Cloud-radar beschrijft pilots voor Trivy en Checkov;
  die tekst is hier niet als onafhankelijk bevestigd klantbewijs gepresenteerd.
  De Cloud-radar zelf vraagt nog om validatie door de owners.
- **Assess:** alle andere positieve kandidaten zijn onderzoeksvoorstellen.
  Publieke projectdocumentatie bewijst functionaliteit, geen FreshMinds-ervaring.
- **Hold:** de OAuth password grant en implicit grant zijn gebaseerd op de
  IETF Security Best Current Practice, RFC 9700. Het onderscheid blijft expliciet:
  password grant is **MUST NOT**; implicit is **SHOULD NOT** met beperkte uitzonderingen.

## Bronnen per entry

De link in elke radarentry opent de primaire bron. Ringposities blijven een
FreshMinds-voorstel; ze zijn geen oordeel dat uit productdocumentatie volgt.

| Entry | Primaire bron | Te toetsen toepassing |
|---|---|---|
| Rust | [Rust ownership](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) | Geheugenveiligheid voor specifieke componenten; dependencies en unsafe blijven reviewpunten. |
| Spring Security | [Spring-project](https://spring.io/projects/spring-security/) | Java-beveiligingsconfiguratie en tests per project. |
| ASP.NET Core Identity | [Microsoft passkeys-documentatie](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/?view=aspnetcore-10.0) | Identity-integratie en accountherstel; ingebouwde passkeys vanaf .NET 10. |
| Microsoft Entra ID | [Microsoft Entra](https://learn.microsoft.com/en-us/entra/fundamentals/what-is-entra) | Medewerkeridentiteiten tegenover externe identiteiten; tenant- en licentiegrenzen. |
| Keycloak | [Keycloak-integraties](https://www.keycloak.org/securing-apps/overview) | Eigen beheer, federatie, updates en herstel. |
| Azure Key Vault | [Microsoft overzicht](https://learn.microsoft.com/en-us/azure/key-vault/general/overview) | Beheerde Azure-secrets tegenover Vault en andere cloudplatformen. |
| SonarQube | [Security rules](https://docs.sonarsource.com/sonarqube-server/quality-standards-administration/managing-rules/security-related-rules) | Editie- en taaldekking, hotspotreview en opvolging. |
| Trivy | [Projectdocumentatie](https://trivy.dev/docs/latest/getting-started/) | Kwetsbaarheden, secrets, configuratiechecks en bruikbare triage. |
| Checkov | [Projectoverzicht](https://www.checkov.io/) | Aanvullende IaC-policies naast Trivy; voorkom dubbele meldingen. |
| HashiCorp Vault | [Vault-architectuur](https://developer.hashicorp.com/vault/docs/about-vault/how-vault-works) | Dynamische credentials, beheer en herstel. |
| ZAP Automation Framework | [Frameworkdocumentatie](https://www.zaproxy.org/docs/automate/automation-framework/) | Geauthenticeerde DAST-plannen op een geschikte testomgeving. |
| Sigstore Cosign | [Cosign quickstart](https://docs.sigstore.dev/quickstart/quickstart-cosign/) | Verificatie van signatures én de verwachte uitgever/identiteit. |
| Falco | [Projectdocumentatie](https://falco.org/docs/) | Runtime-detectie, tuning en aansluiting op incidentrespons. |
| Open Policy Agent | [OPA-documentatie](https://www.openpolicyagent.org/docs) | Eigenaarschap en tests voor autorisatie- en infrastructuurpolicies. |
| Passkeys | [W3C WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/) | Phishingbestendig aanmelden, registratie en accountherstel. |
| OWASP ASVS 5.0 | [Officiële ASVS-site](https://asvs.owasp.org/) | Verificatieniveau en toetsbare acceptatiecriteria; gebruik de stabiele baseline. |
| OAuth Authorization Code + PKCE | [RFC 9700 §2.1.1](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.1.1) | Redirect-validatie, PKCE S256 en token-/sessiebeheer. |
| SLSA provenance | [Goedgekeurde v1.2](https://slsa.dev/spec/v1.2/) | Verifieerbare bron- en buildherkomst, afgestemd op risico. |
| CycloneDX SBOM | [Specificatie-overzicht](https://cyclonedx.org/specification/overview/) | Generatie en volledigheid per release; SPDX blijft een mogelijke formaatkeuze. |
| OAuth Implicit Grant | [RFC 9700 §2.1.2](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.1.2) | Geen standaardkeuze voor nieuwe integraties; beoordeel uitzonderingen zorgvuldig. |
| OAuth Password Grant (ROPC) | [RFC 9700 §2.4](https://www.rfc-editor.org/rfc/rfc9700.html#section-2.4) | Vervangen door een passende moderne flow. |

## Besluiten voor de Security owners

1. Bevestig of de bestaande Adopt/Trial-aanbevelingen ook voor Security gelden,
   met concrete praktijkervaring en een eigenaar; verplaats naar Assess waar dat ontbreekt.
2. Kies gerichte pilots voor identity, secrets en supply-chain-verificatie, met
   succescriteria. Pas de bestaande ringdefinities toe voordat kandidaten promoveren.
3. Bepaal de scope van de unit: dit concept legt nadruk op application/cloud
   security en DevSecOps, en vormt geen complete SOC-, GRC- of endpointsecurity-catalogus.
4. Beoordeel overlap tussen Trivy/Checkov en Vault/Key Vault in de klantcontext.
   Deze radar kiest nog geen universele vervanger of cloud-onafhankelijke winnaar.
5. Verzamel feedback op het concept en volg de afgesproken publicatiecyclus.

Bewust niet opgenomen: generieke categorieën zoals alleen “Zero Trust” of
“AI Security”, extra concurrerende scanners zonder concrete keuzevraag, en
een negatieve Vault-positie uitsluitend op basis van licentiewijzigingen.
