using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DigitSum
{
	public class Program
	{
		public static void Main(string[] args)
		{

			//string input = "BMC_TEST_INPUT_MAGIC";
			//long A = 0;
			//long.TryParse(input, out A);

			DateTime d1 = DateTime.Now;
			Console.WriteLine(sum(10));
			DateTime d2 = DateTime.Now;
			Console.WriteLine("Tempo - 99: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			d1 = DateTime.Now;
			Console.WriteLine(sum(15));
			d2 = DateTime.Now;
			Console.WriteLine("Tempo - 10: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			d1 = DateTime.Now;
			Console.WriteLine(sum(1234));
			d2 = DateTime.Now;
			Console.WriteLine("Tempo - 1234: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			d1 = DateTime.Now;
			Console.WriteLine(sum(999));
			d2 = DateTime.Now;
			Console.WriteLine("Tempo - 999: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			d1 = DateTime.Now;
			Console.WriteLine(sum(9999));
			d2 = DateTime.Now;
			Console.WriteLine("Tempo - 9999: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			d1 = DateTime.Now;
			Console.WriteLine(sum(99999));
			d2 = DateTime.Now;
			Console.WriteLine("Tempo - 99999: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			d1 = DateTime.Now;
			Console.WriteLine(sum(999999));
			d2 = DateTime.Now;
			Console.WriteLine("Tempo - 999999: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			d1 = DateTime.Now;
			Console.WriteLine(sum(9999999));
			d2 = DateTime.Now;
			Console.WriteLine("Tempo - 9999999: {0} milisegundos", d2.Subtract(d1).TotalMilliseconds);

			Console.WriteLine("KBO");
			Console.Read();
		}

		static long sum(long A)
		{
			long iPart = 0;

			for (long i = 1; i <= A; i++)
			{
				if ((i / 10.0d) >= 1.0d)
					iPart += sumPart(i);
				else
					iPart += i;
			}

			return iPart;
		}
		static long sumPart(long part)
		{
			long sum = part % 10;

			if (part - sum > 0)
				sum += sumPart((part - sum) / 10);

			return sum;
		}
	}
}
