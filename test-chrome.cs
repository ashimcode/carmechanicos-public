using System;
using System.IO;
using System.Diagnostics;
using System.Threading;

class Program {
    static void Main(string[] args) {
        string tempDir = Path.Combine(Path.GetTempPath(), "chrome-test-" + Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);
        string targetPath = args.Length > 0
            ? Path.GetFullPath(args[0])
            : Path.Combine(AppContext.BaseDirectory, "index.html");
        if (!File.Exists(targetPath)) {
            Console.Error.WriteLine($"Test target not found: {targetPath}");
            return;
        }
        string url = new Uri(targetPath).AbsoluteUri;
        
        Process p = new Process();
        p.StartInfo.FileName = "chrome";
        p.StartInfo.Arguments = $"--headless=new --disable-gpu --remote-debugging-port=9222 --user-data-dir=\"{tempDir}\" \"{url}\"";
        p.StartInfo.UseShellExecute = false;
        p.StartInfo.CreateNoWindow = true;
        p.Start();
        
        Thread.Sleep(3000);
        
        try {
            using (var client = new System.Net.WebClient()) {
                string json = client.DownloadString("http://localhost:9222/json");
                Console.WriteLine(json);
            }
        } catch (Exception e) {
            Console.WriteLine(e.Message);
        }
        
        p.Kill();
        Directory.Delete(tempDir, true);
    }
}
