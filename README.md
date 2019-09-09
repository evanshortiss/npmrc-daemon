# npmrcd

<div align="center">
  <p>Automagically switch between private and public npm registries.</p>
  <img alt="Extension Example GIF" width="500" src="https://github.com/evanshortiss/npmrc-daemon/blob/master/screenshots/notification.png?raw=true"/>
  <p>You get a nice notification when the registry switch occurs ⏰</p>
</div>

## About

Since I frequently change between working from home, on the road, and the
office I wanted to make sure I was using the private registry when connected
to our corporate networks.

This is daemon that watches for, and automatically switch between private/work
and public/default npm registries based on the availability of the private
registry.

If the private registry can be resolved via DNS this daemon will switch your
_.npmrc_ file using the [npmrc](https://github.com/deoxxa/npmrc) in the
background. This is a basic detection mechanism, and could be modified to have
more complex triggers if necessary.

## Requirements

* Node.js 10+
* npm 6+
* macOS (PRs adding Linux daemon setups are very welcome)

## Setup

Run the setup script using `npx`. The *registry* parameter is required. 

```bash
# Install and setup the daemon with a cafile for the registry
npx npmrcd setup \
 --cafile="https://certs.acme.com/ACME-Root-CA.crt" \
 --registry="https://eng.acme.com/nexus/repository/registry.npmjs.org"
```

## Daemon Setup Options

The *cafile* parameter is optional and only required if access to the given
*registry* requires a CA Certificate file.

A *triggerssid* parameter is also supported to specify WiFi networks where the
daemon should switch to the private registry even if it's not accessible. This
is useful if the registry should be used in conjunction with a VPN on specific
networks. 

For example, the following setup would switch to the `eng.acme.com` registry
if the address can be resolved using DNS or the machine is connected to one of
the listed SSIDs.

```bash
npx npmrcd setup \
 --triggerssid="Acme Guest Wifi" \
 --triggerssid="Acme Customer Wifi" \
 --cafile="https://certs.acme.com/ACME-Root-CA.crt" \
 --registry="https://eng.acme.com/nexus/repository/registry.npmjs.org"
```

The [registry](https://docs.npmjs.com/misc/config#registry) and
[cafile](https://docs.npmjs.com/misc/config#cafile) options are explained in 
detail in the [npm-config docs](https://docs.npmjs.com/misc/config).

## Uninstall

```bash
# Remove the daemon
npx npmrcd remove
```

## Daemon Logs

### macOS & Linux

* Logs are stored in _/tmp/npmrcd.stdout_ and _/tmp/npmrcd.stderr_.
* Configuration files are stored in _~/.npmrcd_ and _~/.npmrcs_.
