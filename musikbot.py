import youtube_dl
import discord
from discord.ext import commands
import asyncio

intents = discord.Intents.default()
intents.voice_states = True
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

class YTDLSource(discord.PCMVolumeTransformer):
    def __init__(self, source, *, data, volume=0.5):
        super().__init__(source, volume)

        self.data = data
        self.title = data.get('title')
        self.url = data.get('url') if data.get('url') else data.get('formats')[0]['url']

    @classmethod
    async def from_url(cls, url, *, loop=None, stream=False):
        loop = loop or asyncio.get_event_loop()
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        C:\Programs\Other Programs\Youtube-DL\youtube-dl.exe
        data = await loop.run_in_executor(None, lambda: youtube_dl.YoutubeDL(ydl_opts).extract_info(url, download=not stream))
        if 'entries' in data:
            data = data['entries'][0]

        filename = '/path/to/save/directory/' + (data['url'] if stream else youtube_dl.YoutubeDL(ydl_opts).prepare_filename(data))
        return cls(discord.FFmpegPCMAudio(filename), data=data)

class Music(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        print("Bot is ready.")


    @commands.command(name='join', help='Tells the bot to join the voice channel')
    async def join(self, ctx):
        if not ctx.author.voice:
            await ctx.send("You are not connected to a voice channel.")
            return

        channel = ctx.author.voice.channel
        voice_client = ctx.voice_client

        if voice_client and voice_client.is_connected():
            await voice_client.move_to(channel)
        else:
            await channel.connect()

        await ctx.send(f"Joined {channel}")

    @commands.command(name='play', help='To play a song')
    async def play(self, ctx, *, url):
        if not ctx.author.voice:
            await ctx.send("You are not connected to a voice channel.")
            return

        voice_channel = ctx.author.voice.channel
        voice_client = ctx.voice_client

        if not voice_client:
            voice_client = await voice_channel.connect()
        elif voice_client.channel != voice_channel:
            await voice_client.move_to(voice_channel)

        async with ctx.typing():
            try:
                player = await YTDLSource.from_url(url, loop=self.bot.loop)
                voice_client.play(player, after=lambda e: print('Player error:', e) if e else None)
                await ctx.send(f"Now playing: {player.title}")
            except Exception as e:
                await ctx.send(f"An error occurred: {str(e)}")

    @commands.command(name='stop', help='This command stops the song')
    async def stop(self, ctx):
        voice_client = ctx.voice_client
        if voice_client and voice_client.is_playing():
            voice_client.stop()
            await ctx.send("Playback stopped.")

    @commands.command(name='leave', help='To make the bot leave the voice channel')
    async def leave(self, ctx):
        voice_client = ctx.voice_client


async def setup():
    await bot.add_cog(Music(bot))


async def run():
    token = 'Token_Number'  # Replace with your bot token
    await bot.login(token)
    await bot.connect()


if __name__ == "__main__":
    asyncio.run(setup())
    asyncio.run(run())