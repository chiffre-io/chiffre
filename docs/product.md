# Chiffre.io - E2EE Analytics

Insight for the post-surveillance age

Google Analytics rules the web for website/webapp usage insight, for one simple
reason: it is free. But this freedom comes at the cost of sending Google
everything about the way your business runs, and get a subset of the insight
in return.
Your users are tracked across the web for ad money, and if those tech giants
see a competitive advantage, you have no chance.

If you were the only one to get that insight, how much of a strategic advantage
would you gain ?

This is only possible with one thing: End-to-End Encrypted Analytics. Here is
how it works:

1. Your visitors perform actions on your website/webapp, and anonymous data
   points are collected, along with business metrics
2. Those data points are encrypted on the visitor’s browser and sent to our service
3. You log into your dashboard, which unlocks the key to decrypting the data points, and gain precious insight
4. At no point between your clients and your dashboard can the data be used against you (including by us, we don’t have the key !)

We’re just middlepeople for locked packages of data, so only you get the insight you need.

Because our word on transparency is not enough, our services are entirely open-source and auditable on GitHub.

## Ideas & Features

- Consent management: users can opt-out of telemetry either on a global level (don’t send anything) or on an event-type level (send anonymous metrics but don’t try to identify me with session/auth IDs): visitor framework will automatically list the types of events that will be sent (built-in, custom have to be declared)

## Organisations / Teams

Shared projects across multiple users will be desirable. In order to ship an MVP without implementing the whole feature set first, orgs will have to be plugged on top of an existing personal account system.
Orgs will not be accounts, but vaults where the private keys to shared projects live, and which key is shared amongst members.

It is necessary to keep a clear-text record of what organisation each user belongs to, for pricing and security.

## Tracked Event Types

- session:start (tab opened)
  - url
  - referrer
  - generate session UUID
  - visit # (counter)
  - userAgent
  - language
  - country (based on IP)
  - window dimensions
- session:end (tab closed)
  - session duration (total time end-start)
  - active duration (don’t count unfocused periods)
  - track changes:
    - window dimensions (has the browser been resized ?)
- session:pause (tab/browser no longer focused)
  - just keep a local record of the timestamp, don’t send
- session:resume (tab/browser back in focus)
  - same as session:pause
- page:enter
  - path
  - referer
- page:leave
  - duration on page
- customEvent
  - custom data

Note: session ID is not necessary if events are bundled up into a single data point sent at the end of the session
If it does not fit into a single bundle/chunk, session ID will have to be used and refered to in every event that can
relate to a session.

Reactivity

In order to give users a sense of reactivity, acquisition of Data Points should be done in real-time, through a WebSocket link to the server.
Then decryption can occur on the fly upon reception of Data Points and the contained Events can be processed and added to the dashboard.

## Example Use-Cases

- Website visit analytics
- Webapp user interaction analytics
- Logging the amount of time spent on each project in VSCode => send events that the editor is focused, that a project is opened, text is being typed in, commits are being logged/pushed. This would need some automated system on the receiving end to calculate the useful stuff and send digests.

Application Layer Ideas

Config-based event consumption and digestion into analytics streams (re-encrypted and sent back to a long-lasting queue for dashboards & triggers)
